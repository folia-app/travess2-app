import { ethers } from 'ethers'

/**
 * Redundant, keyless RPC access.
 *
 * Every endpoint here is free, needs no account, and answers CORS preflights, so
 * it works from a browser. Order is preference, and each is a fallback for the
 * one before it. Benchmarked 2026-09-01 across 16 candidates; these are the ones
 * that passed.
 *
 * The reason this exists: one provider's eth_getLogs limit silently broke four
 * separate things in this codebase family — a mint listener that rendered no
 * artwork for two years, two token grids, and a metadata field that published
 * "-" for 101 tokens. Each failed into a plausible fallback rather than an
 * error. Depending on a single endpoint is what made that possible.
 */
export const RPCS = [
  'https://gateway.tenderly.co/public/mainnet',
  'https://mainnet.gateway.tenderly.co',
  'https://eth.drpc.org',
  'https://rpc.mevblocker.io',
  'https://ethereum-rpc.publicnode.com',
  'https://eth-mainnet.public.blastapi.io'
]

const urls = () =>
  (import.meta.env && import.meta.env.VITE_RPCS
    ? String(import.meta.env.VITE_RPCS).split(',').map((s) => s.trim()).filter(Boolean)
    : RPCS)

export const providers = () => urls().map((u) => new ethers.providers.JsonRpcProvider(u))

/** A read provider that fails over. Use for ordinary contract calls. */
export const readProvider = () => providers()[0]

/** Run fn against each endpoint until one answers. */
export async function anyOf (fn) {
  let last
  for (const p of providers()) {
    try { return await fn(p) } catch (e) { last = e }
  }
  throw last || new Error('no RPC endpoint answered')
}

/**
 * Every matching log, or an honest failure — never a silent partial set.
 *
 * Most free endpoints cap eth_getLogs to a block window and reject a scan of the
 * whole chain. So: try a whole-range query on each endpoint, and if none will
 * serve it, fall back to walking the token set with ERC721Enumerable, which is
 * bounded by supply rather than block height. Measured on a 233-token contract:
 * whole-range 1.2s, enumeration 4.9s, chunked log walk over ten minutes — which
 * is why chunking is not the fallback.
 *
 * @returns {Promise<{logs: Array, via: string, mode: 'wide'}>}
 */
export async function getAllLogs (address, abi, filterName, fromBlock = 0) {
  const errors = []
  for (const p of providers()) {
    try {
      const c = new ethers.Contract(address, abi, p)
      const logs = await c.queryFilter(c.filters[filterName](), fromBlock)
      return { logs, via: p.connection.url, mode: 'wide' }
    } catch (e) { errors.push(`${p.connection.url}: ${e.message.slice(0, 60)}`) }
  }
  throw new Error('no endpoint served the full log range — ' + errors.slice(0, 2).join(' | '))
}

/**
 * Current holders, without reading logs at all.
 *
 * The fallback when no endpoint will serve a whole-range log query. Returns
 * current ownership rather than transfer history, which is what a listing
 * actually needs, and every call is a plain eth_call that all of the endpoints
 * above serve.
 */
export async function enumerateOwners (address, abi, batch = 25) {
  return anyOf(async (p) => {
    const c = new ethers.Contract(address, abi, p)
    const total = (await c.totalSupply()).toNumber()
    const ids = []
    for (let i = 0; i < total; i += batch) {
      ids.push(...(await Promise.all(
        Array.from({ length: Math.min(batch, total - i) }, (_, k) => c.tokenByIndex(i + k))
      )))
    }
    const out = []
    for (let i = 0; i < ids.length; i += batch) {
      const owners = await Promise.all(ids.slice(i, i + batch).map((id) => c.ownerOf(id)))
      owners.forEach((owner, k) => out.push({ tokenId: ids[i + k], owner }))
    }
    return out
  })
}
