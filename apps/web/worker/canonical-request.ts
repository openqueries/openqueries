const CANONICAL_HOST = "openqueries.org";
const ALIAS_HOST = "www.openqueries.org";

export function canonicalRequestRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const isPublicHost =
    url.hostname === CANONICAL_HOST || url.hostname === ALIAS_HOST;

  if (!isPublicHost) return null;
  if (url.hostname === CANONICAL_HOST && url.protocol === "https:") {
    return null;
  }

  url.hostname = CANONICAL_HOST;
  url.protocol = "https:";
  url.port = "";
  return Response.redirect(url.toString(), 308);
}
