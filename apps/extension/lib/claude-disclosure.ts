const inspectedDisclosures = new WeakSet<HTMLButtonElement>();

function isCollapsedWebSearch(button: HTMLButtonElement): boolean {
  return (
    button.getAttribute("aria-expanded") === "false" &&
    /^searched the web\b/iu.test((button.textContent ?? "").trim())
  );
}

export function revealClaudeSearchDetails(document: Document): void {
  for (const element of document.querySelectorAll(
    "button[aria-expanded='false']",
  )) {
    if (!(element instanceof document.defaultView!.HTMLButtonElement)) continue;
    if (!isCollapsedWebSearch(element) || inspectedDisclosures.has(element))
      continue;
    inspectedDisclosures.add(element);
    element.click();
    document.defaultView?.setTimeout(() => {
      if (
        element.isConnected &&
        element.getAttribute("aria-expanded") === "true"
      )
        element.click();
    }, 350);
  }
}
