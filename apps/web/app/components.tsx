import Link from "next/link";
import type { ReactNode } from "react";

export function Brand() {
  return (
    <Link className="brand" href="/">
      <span className="brand-mark">OQ</span>
      <span>Open Queries</span>
    </Link>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav aria-label="Main navigation">
            <Link href="/methodology">Methodology</Link>
            <Link href="/learn">Learn</Link>
            <Link href="/open-source">Open source</Link>
            <a className="nav-cta" href="/#install">
              Get the extension <span>↗</span>
            </a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div>
          <Brand />
          <p>Make AI search transparent.</p>
        </div>
        <div className="footer-links">
          <Link href="/methodology">Methodology</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/open-source">AGPL source</Link>
        </div>
        <p className="footer-note">
          Independent open-source research infrastructure. Not affiliated with
          OpenAI, Anthropic or Google.
        </p>
      </footer>
    </>
  );
}

export function QueryInterface() {
  const searches = [
    ["01", "expense management tools for European startups", "91%"],
    ["02", "best corporate card software multi entity", "84%"],
    ["03", "expense software pricing comparison 2026", "77%"],
  ];
  return (
    <aside
      className="query-interface"
      aria-label="Illustration of the Open Queries side panel"
    >
      <div className="interface-top">
        <div>
          <span className="interface-logo">OQ</span>
          <strong>Open Queries</strong>
        </div>
        <small>
          <i /> Donating
        </small>
      </div>
      <div className="interface-title">
        <span>Live query trace</span>
        <h2>What the model searched</h2>
      </div>
      <article className="interface-query">
        <div className="query-source">
          <span>C</span>
          <strong>Claude</strong>
          <small>14:32</small>
          <em>Observed</em>
        </div>
        <p>best expense management platforms for growing teams</p>
        <button>✦ Estimate fan-outs</button>
        <div className="interface-fanouts">
          <header>
            <span>Estimated fan-outs</span>
            <small>Model likelihood</small>
          </header>
          {searches.map(([rank, query, score]) => (
            <div key={rank}>
              <small>{rank}</small>
              <span>{query}</span>
              <strong>{score}</strong>
            </div>
          ))}
        </div>
      </article>
      <div className="interface-nav">
        <span>
          ⌁<small>Current</small>
        </span>
        <span>
          ◷<small>History</small>
        </span>
        <span>
          ⚙<small>Settings</small>
        </span>
      </div>
    </aside>
  );
}

export function EditorialPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <SiteShell>
      <header className="editorial-hero container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      <article className="editorial-body container">{children}</article>
    </SiteShell>
  );
}
