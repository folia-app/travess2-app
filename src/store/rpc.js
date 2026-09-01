import { ethers } from 'ethers'


/**
 * A provider that spreads load, limits concurrency, and backs off.
 *
 * The first version of this pointed every read at one free gateway with no
 * throttle. That works until a page renders a hundred owner addresses: each
 * Addr component resolves ENS, reverse resolution is roughly four calls, and the
 * page fires four hundred requests in a burst. Free gateways rate-limit per IP
 * over a time window, so the burst earns 429s, the queries throw, and the grid
 * empties — the same symptom as the bug this was meant to fix, from the
 * opposite cause.
 *
 * So three things, all at the transport layer where every existing call site
 * gets them for free:
 *
 *   - requests round-robin across the pool instead of hammering one host
 *   - a semaphore caps how many are in flight at once
 *   - 429 and 5xx retry with exponential backoff and jitter, moving to the next
 *     endpoint each attempt
 */
class PooledProvider extends ethers.providers.JsonRpcProvider {
  constructor (urls, { concurrency = 4, retries = 4 } = {}) {
    super(urls[0])
    this._urls = urls.slice()
    this._cursor = 0
    this._maxInFlight = concurrency
    this._inFlight = 0
    this._waiting = []
    this._retries = retries
    this._id = 0
  }

  _next () {
    const u = this._urls[this._cursor % this._urls.length]
    this._cursor++
    return u
  }

  async _acquire () {
    if (this._inFlight < this._maxInFlight) { this._inFlight++; return }
    await new Promise((resolve) => this._waiting.push(resolve))
    this._inFlight++
  }

  _release () {
    this._inFlight--
    const next = this._waiting.shift()
    if (next) next()
  }

  async send (method, params) {
    await this._acquire()
    try {
      let lastErr
      for (let attempt = 0; attempt <= this._retries; attempt++) {
        const url = this._next()
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: ++this._id, method, params })
          })
          if (res.status === 429 || res.status >= 500) {
            lastErr = new Error(`${res.status} from ${url}`)
          } else {
            const json = await res.json()
            if (json.error) {
              // A real rpc error — wrong args, unsupported method, range too
              // wide. Retrying will not change the answer, so surface it.
              const e = new Error(json.error.message || 'rpc error')
              e.code = json.error.code
              throw e
            }
            return json.result
          }
        } catch (e) {
          if (e && e.code !== undefined) throw e   // genuine rpc error
          lastErr = e
        }
        // backoff with jitter; every attempt also moves to the next endpoint
        const wait = Math.min(2000, 150 * 2 ** attempt) + Math.random() * 120
        await new Promise((r) => setTimeout(r, wait))
      }
      throw lastErr || new Error('all endpoints failed')
    } finally {
      this._release()
    }
  }
}


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
export const readProvider = () => new PooledProvider(urls())

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
 * Transfer events, or something the caller can treat as them.
 *
 * Wide log queries are the fast path but only some endpoints allow them. When
 * none will, this falls back to enumerating current holders and synthesising a
 * mint-shaped event per token — from = the zero address, to = the current owner.
 * A listing built by replaying these arrives at the same state it would have
 * reached by replaying the real history, because the only thing it derives from
 * a transfer is who holds the token now.
 *
 * What it does not give you is history: no previous owners, no timestamps, no
 * ordering. Anything that needs those must use `mode` to tell the difference
 * rather than assume.
 *
 * This is the redundancy that matters. Enumeration is plain eth_call work, which
 * every endpoint in the pool serves, so losing the one provider that answers
 * whole-range log queries degrades speed and detail — not correctness of the
 * listing.
 */
export async function getTransferEvents (address, abi, fromBlock = 0) {
  try {
    const { logs, via } = await getAllLogs(address, abi, 'Transfer', fromBlock)
    return { events: logs, via, mode: 'logs' }
  } catch (logErr) {
    const holders = await enumerateOwners(address, abi)
    const events = holders.map(({ tokenId, owner }) => ({
      args: [ethers.constants.AddressZero, owner, tokenId]
    }))
    return { events, via: 'enumeration', mode: 'owners', logError: logErr.message }
  }
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
