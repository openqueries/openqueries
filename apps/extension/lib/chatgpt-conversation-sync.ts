type NativeFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export function chatGptConversationUrl(location: Location): string | null {
  const conversationId = location.pathname.match(
    /^\/c\/([^/?#]+)(?:[/?#]|$)/u,
  )?.[1];
  if (!conversationId) return null;
  return new URL(
    `/backend-api/conversation/${encodeURIComponent(conversationId)}`,
    location.origin,
  ).href;
}

export function createChatGptConversationSync(
  nativeFetch: NativeFetch,
  inspect: (text: string) => void,
): {
  cloneRequest(input: Parameters<Window["fetch"]>): Request | null;
  rememberProviderRequest(request: Request | null, response: Response): void;
  reconcileAfterNetworkActivity(): void;
} {
  let snapshotRequest: Request | null = null;
  let authenticatedGetTemplate: Request | null = null;
  let reconcileTimer: number | null = null;

  const cloneRequest = (input: Parameters<Window["fetch"]>): Request | null => {
    try {
      const method =
        input[0] instanceof Request
          ? input[0].method
          : (input[1]?.method ?? "GET");
      if (method.toUpperCase() !== "GET") return null;
      return new Request(input[0], input[1]);
    } catch {
      return null;
    }
  };

  const rememberProviderRequest = (
    request: Request | null,
    response: Response,
  ): void => {
    if (!request || !response.ok || request.method !== "GET") return;
    try {
      const responseUrl = new URL(response.url);
      if (
        responseUrl.origin === window.location.origin &&
        responseUrl.pathname.startsWith("/backend-api/")
      )
        authenticatedGetTemplate = request;
    } catch {
      return;
    }
    if (response.url === chatGptConversationUrl(window.location))
      snapshotRequest = request;
  };

  const requestForSnapshot = (snapshotUrl: string): Request | null => {
    if (snapshotRequest?.url === snapshotUrl) return snapshotRequest.clone();
    if (!authenticatedGetTemplate) return null;
    const template = authenticatedGetTemplate;
    return new Request(snapshotUrl, {
      cache: "no-store",
      credentials: template.credentials,
      headers: template.headers,
      method: "GET",
      mode: template.mode,
      redirect: template.redirect,
      referrer: template.referrer,
      referrerPolicy: template.referrerPolicy,
    });
  };

  const reconcileAfterNetworkActivity = (): void => {
    if (reconcileTimer != null) window.clearTimeout(reconcileTimer);
    reconcileTimer = window.setTimeout(() => {
      reconcileTimer = null;
      const snapshotUrl = chatGptConversationUrl(window.location);
      if (!snapshotUrl) return;
      const request = requestForSnapshot(snapshotUrl);
      if (!request) return;
      void nativeFetch(request, { cache: "no-store" })
        .then((response) => {
          if (response.ok) snapshotRequest = request.clone();
          return response.ok ? response.text() : "";
        })
        .then((text) => {
          if (text) inspect(text);
        })
        .catch(() => undefined);
    }, 400);
  };

  return {
    cloneRequest,
    rememberProviderRequest,
    reconcileAfterNetworkActivity,
  };
}
