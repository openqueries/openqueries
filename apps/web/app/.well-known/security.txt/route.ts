export function GET() {
  return new Response(
    [
      "Contact: mailto:security@openqueries.org",
      "Contact: https://github.com/openqueries/openqueries/security/advisories/new",
      "Canonical: https://openqueries.org/.well-known/security.txt",
      "Policy: https://openqueries.org/security",
      "Preferred-Languages: en, de",
      "Expires: 2027-08-09T00:00:00.000Z",
      "",
    ].join("\n"),
    {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=86400",
      },
    },
  );
}
