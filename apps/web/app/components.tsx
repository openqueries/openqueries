import {
  Activity,
  ChevronRight,
  History,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { OpenQueriesMark, ProviderLogo } from "@openqueries/provider-icons";
import type { SimpleIcon } from "simple-icons";
import { siGithub, siGooglechrome } from "simple-icons";

import { CHROME_WEB_STORE_URL } from "@/lib/site";

export function BrandIcon({
  icon,
  size = 16,
}: {
  icon: SimpleIcon;
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d={icon.path} />
    </svg>
  );
}

export function Brand() {
  return (
    <Link className="brand" href="/">
      <span className="brand-mark">
        <OpenQueriesMark size={17} />
      </span>
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
            <a
              aria-label="Open Queries on GitHub"
              className="nav-icon"
              href="https://github.com/openqueries/openqueries"
            >
              <BrandIcon icon={siGithub} size={17} />
            </a>
            <Link className="nav-cta" href="/install">
              <BrandIcon icon={siGooglechrome} size={15} />
              Get extension
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div>
          <Brand />
          <p>Open infrastructure for transparent AI search.</p>
        </div>
        <div className="footer-links">
          <Link href="/methodology">Methodology</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/support">Support</Link>
          <Link href="/security">Security</Link>
          <Link href="/open-source">Open source</Link>
          <a href={CHROME_WEB_STORE_URL}>Chrome Web Store</a>
          <a href="https://github.com/openqueries/openqueries">GitHub</a>
        </div>
        <p className="footer-note">
          Independent and open source. Not affiliated with OpenAI, Anthropic or
          Google.
        </p>
      </footer>
    </>
  );
}

export function QueryInterface() {
  const searches = [
    "expense management software comparison Europe",
    "corporate cards multi entity expense controls",
    "expense platform pricing for growing teams",
  ];
  return (
    <aside
      className="query-interface"
      aria-label="Preview of the Open Queries Chrome side panel"
    >
      <div className="interface-top">
        <div>
          <span className="interface-logo">
            <OpenQueriesMark size={16} />
          </span>
          <strong>Open Queries</strong>
        </div>
        <small>
          <i /> Local only
        </small>
      </div>
      <div className="interface-title">
        <span>Live query trace</span>
        <h2>What the model searched</h2>
        <b>1</b>
      </div>
      <article className="interface-query">
        <div className="query-source">
          <span>
            <ProviderLogo provider="claude" size={13} />
          </span>
          <strong>Claude</strong>
          <small>14:32</small>
          <em>Observed</em>
        </div>
        <p>best expense management platforms for growing teams</p>
        <button>
          <Search size={13} /> Estimate fan-outs
        </button>
        <div className="interface-fanouts">
          <header>
            <span>Estimated fan-outs</span>
            <small>Rank · evidence</small>
          </header>
          {searches.map((query, index) => (
            <div key={query}>
              <small>{String(index + 1).padStart(2, "0")}</small>
              <span>{query}</span>
              <ChevronRight size={14} />
            </div>
          ))}
          <p>
            Estimated, not observed. Open scoring details for the underlying
            evidence.
          </p>
        </div>
      </article>
      <div className="interface-privacy">
        <ShieldCheck size={13} /> Queries only. Conversations are never read.
      </div>
      <div className="interface-nav">
        <span className="active">
          <Activity size={16} /> <small>Current</small>
        </span>
        <span>
          <History size={16} /> <small>History</small>
        </span>
        <span>
          <Settings size={16} /> <small>Settings</small>
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
