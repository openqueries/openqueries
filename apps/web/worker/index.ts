import handler from "vinext/server/app-router-entry";

import { handleApi, runRetentionMaintenance } from "./api";
import type { AppEnv } from "./env";

function securityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  headers.set(
    "content-security-policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const worker = {
  async fetch(
    request: Request,
    env: AppEnv,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    if (url.hostname === "www.openqueries.org") {
      url.hostname = "openqueries.org";
      url.protocol = "https:";
      url.port = "";
      return Response.redirect(url.toString(), 308);
    }
    const apiResponse = await handleApi(request, env);
    if (apiResponse) return securityHeaders(apiResponse);
    // The Cloudflare Vite binding also serves source CSS during `vinext dev`.
    // Production assets are fingerprinted under /assets; keeping this narrow
    // prevents arbitrary application routes from bypassing the RSC handler.
    if (url.pathname === "/app/globals.css") {
      // Vinext currently emits the source CSS as a stylesheet URL in dev,
      // while Vite serves that URL as a JS style module unless `?direct` is
      // present. Rewrite only this dev-time request to preserve the MIME type.
      url.searchParams.set("direct", "");
      return securityHeaders(await env.ASSETS.fetch(new Request(url, request)));
    }
    if (
      /^\/(?:assets\/|favicon\.svg$|og\.(?:svg|png)$|\.well-known\/security\.txt$)/u.test(
        url.pathname,
      )
    ) {
      return securityHeaders(await env.ASSETS.fetch(request));
    }
    return securityHeaders(await handler.fetch(request, env, ctx));
  },
  async scheduled(
    controller: ScheduledController,
    env: AppEnv,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(runRetentionMaintenance(env, controller.scheduledTime));
  },
} satisfies ExportedHandler<AppEnv>;

export default worker;
