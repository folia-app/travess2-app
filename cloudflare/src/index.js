/**
 * One Netlify site, as one Worker.
 *
 * Netlify splits this across a site build plus netlify.toml. Cloudflare Pages
 * cannot express the half that matters — "Proxying will only support relative
 * URLs on your site. You cannot proxy external domains" — and every folia site
 * that talks to Fly depends on exactly that. So the redirects become code, and
 * the static build rides along as an assets binding.
 *
 * The proxied URLs must not change in the address bar: they are published in
 * NFT metadata, so a 301 would break the contract with anything that stored
 * them. Hence fetch-and-return rather than redirect.
 *
 * Asset lookup is spelled out here rather than left to the platform. The two
 * hosts disagree by default: Netlify serves both /holes and /holes.html as
 * 200, while Cloudflare's assets binding 307s /holes.html across to /holes.
 * That turned three of this site's own links into redirects. So the binding is
 * configured with html_handling = "none" — serve exactly what is asked for —
 * and the .html and index fallbacks are applied below, in the order Netlify
 * applies them.
 *
 * CONFIG is generated per site from that site's netlify.toml.
 */
const CONFIG = {"spa":true,"headers":{"Permissions-Policy":"interest-cohort=()"}}

export default {
  async fetch (request, env) {
    const url = new URL(request.url)

    // Rules run in netlify.toml order and stop at the first match. Rewrites are
    // internal — the address bar keeps the requested path, which is the point
    // for /works/chameleon.
    for (const [from, to] of Object.entries(CONFIG.rewrites || {})) {
      if (url.pathname !== from) continue
      return decorate(await asset(env, request, to))
    }

    for (const r of CONFIG.routes || []) {
      if (!url.pathname.startsWith(r.prefix)) continue
      const path = r.strip ? url.pathname.slice(r.prefix.length - 1) : url.pathname
      const upstream = await fetch(r.origin + path + url.search, {
        method: request.method,
        headers: request.headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'follow'
      })
      // Upstream headers pass through untouched; CONFIG.headers is Netlify's
      // [[headers]] block, which only ever applied to this site's own assets.
      return new Response(upstream.body, { status: upstream.status, headers: upstream.headers })
    }

    let res = await asset(env, request, url.pathname)

    // A directory asks for its index: "/" -> "/index.html". With html_handling
    // off nothing does this for us, and every site here has a root index.
    if (res.status === 404 && url.pathname.endsWith('/')) {
      const idx = await asset(env, request, url.pathname + 'index.html')
      if (idx.status !== 404) res = idx
    }

    // /holes -> /holes.html, the way Netlify resolves a bare path.
    if (res.status === 404 && !/\.[a-z0-9]+$/i.test(url.pathname)) {
      const withExt = url.pathname.replace(/\/$/, '') + '.html'
      const tryExt = await asset(env, request, withExt)
      if (tryExt.status !== 404) res = tryExt
    }

    // The catch-all `from = "/*" to = "/index.html" status = 200`. Only sites
    // whose toml actually declares it get this: turning every unknown path into
    // a 200 on a site that does not want it would change what crawlers see.
    if (res.status === 404 && CONFIG.spa) {
      const index = await asset(env, request, '/index.html')
      if (index.status !== 404) res = new Response(index.body, { status: 200, headers: index.headers })
    }

    return decorate(res)
  }
}

/** Fetch one path out of the assets binding, preserving method and headers. */
function asset (env, request, pathname) {
  const u = new URL(request.url)
  u.pathname = pathname
  u.search = ''
  return env.ASSETS.fetch(new Request(u, { method: request.method, headers: request.headers }))
}

function decorate (res) {
  const extra = CONFIG.headers || {}
  if (!Object.keys(extra).length) return res
  // Assets responses are immutable, so clone before setting anything.
  const out = new Response(res.body, res)
  for (const [k, v] of Object.entries(extra)) out.headers.set(k, v)
  return out
}
