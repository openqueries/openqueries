import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Clock3,
  Database,
  History,
  LoaderCircle,
  Search,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";
import { OpenQueriesMark, ProviderLogo } from "@openqueries/provider-icons";

import type {
  LocalQueryEvent,
  PublicState,
  RuntimeRequest,
  RuntimeResponse,
} from "./lib/types";
import "./style.css";

type View = "current" | "history" | "settings";

async function message(request: RuntimeRequest): Promise<RuntimeResponse> {
  return chrome.runtime.sendMessage(request) as Promise<RuntimeResponse>;
}

function platformLabel(platform: LocalQueryEvent["platform"]) {
  return platform === "chatgpt"
    ? "ChatGPT"
    : platform === "claude"
      ? "Claude"
      : "Google";
}

function kindLabel(event: LocalQueryEvent) {
  if (event.sourceKind === "google_user_search") return "Google search";
  if (event.sourceKind === "observed_expanded_query") return "Observed fan-out";
  return "Observed";
}

function FanOutRow({
  fanOut,
  eventId,
}: {
  fanOut: NonNullable<LocalQueryEvent["fanOuts"]>[number];
  eventId: string;
}) {
  const [details, setDetails] = useState(false);
  const score = fanOut.score;
  return (
    <div className="fanout-item">
      <div className="fanout-row">
        <span className="fanout-rank">
          {String(fanOut.rank).padStart(2, "0")}
        </span>
        <span>{fanOut.query}</span>
        <button
          className="score-details-button"
          aria-expanded={details}
          aria-label={`Show scoring details for ${fanOut.query}`}
          onClick={() => setDetails((value) => !value)}
        >
          {details ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
      {details ? (
        <dl className="score-details" id={`${eventId}:${fanOut.rank}`}>
          {score.kind === "native_inverse_perplexity" ? (
            <>
              <div>
                <dt>Method</dt>
                <dd>Native token logprobs</dd>
              </div>
              <div>
                <dt>Mean log p</dt>
                <dd>{score.meanTokenLogProbability.toFixed(4)}</dd>
              </div>
              <div>
                <dt>Perplexity</dt>
                <dd>{score.perplexity.toFixed(3)}</dd>
              </div>
              <div>
                <dt>Tokens</dt>
                <dd>{score.tokenCount}</dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt>Method</dt>
                <dd>Repeated native samples</dd>
              </div>
              <div>
                <dt>Included</dt>
                <dd>
                  {score.occurrences}/{score.sampleCount} samples
                </dd>
              </div>
              <div>
                <dt>Wilson 95% CI</dt>
                <dd>
                  {score.confidence95.lower.toFixed(3)}–
                  {score.confidence95.upper.toFixed(3)}
                </dd>
              </div>
            </>
          )}
        </dl>
      ) : null}
    </div>
  );
}

function QueryCard({
  event,
  onEstimate,
  loading,
}: {
  event: LocalQueryEvent;
  onEstimate: (eventId: string) => void;
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(Boolean(event.fanOuts?.length));
  return (
    <article className="query-card">
      <div className="query-card-head">
        <span className={`platform-mark ${event.platform}`}>
          <ProviderLogo provider={event.platform} size={14} />
        </span>
        <div className="query-meta">
          <span>{platformLabel(event.platform)}</span>
          <small>
            {new Date(event.capturedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </small>
        </div>
        <span className="provenance-badge">{kindLabel(event)}</span>
      </div>
      <p className="query-text">{event.query}</p>
      {event.donationBlockedReason ? (
        <p className="privacy-note">Kept local · possible sensitive data</p>
      ) : null}
      <div className="query-actions">
        <button
          className="estimate-button"
          disabled={loading || Boolean(event.donationBlockedReason)}
          onClick={() => onEstimate(event.eventId)}
        >
          {loading ? (
            <LoaderCircle className="spin" size={14} />
          ) : (
            <Sparkles size={14} />
          )}
          {event.fanOuts?.length ? "Refresh estimates" : "Estimate fan-outs"}
        </button>
        {event.fanOuts?.length ? (
          <button
            className="icon-button"
            aria-label={expanded ? "Collapse fan-outs" : "Expand fan-outs"}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : null}
      </div>
      {expanded && event.fanOuts?.length ? (
        <div className="fanout-list">
          <div className="fanout-heading">
            <span>Estimated fan-outs</span>
            <small>Rank · evidence</small>
          </div>
          {event.fanOuts.map((fanOut) => (
            <FanOutRow
              key={`${event.eventId}:${fanOut.query}`}
              fanOut={fanOut}
              eventId={event.eventId}
            />
          ))}
          <p className="estimate-disclaimer">
            Estimated, not observed. Rank is based on provider-native evidence,
            never search volume.
          </p>
        </div>
      ) : null}
    </article>
  );
}

function EmptyState({ current }: { current: boolean }) {
  return (
    <div className="empty-state">
      <div>
        <Search size={20} />
      </div>
      <h2>
        {current
          ? "No searches on this tab yet"
          : "Your query history is empty"}
      </h2>
      <p>
        Open ChatGPT, Claude or Google Search. Explicit web-search queries will
        appear here—never chat messages.
      </p>
    </div>
  );
}

export default function SidePanel() {
  const [state, setState] = useState<PublicState | null>(null);
  const [view, setView] = useState<View>("current");
  const [filter, setFilter] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await message({ type: "openqueries:get-state" });
    if (response.ok && response.state) setState(response.state);
  }, []);

  useEffect(() => {
    void load();
    const reload = () => void load();
    chrome.storage.onChanged.addListener(reload);
    chrome.tabs.onActivated.addListener(reload);
    chrome.windows.onFocusChanged.addListener(reload);
    return () => {
      chrome.storage.onChanged.removeListener(reload);
      chrome.tabs.onActivated.removeListener(reload);
      chrome.windows.onFocusChanged.removeListener(reload);
    };
  }, [load]);

  const events = useMemo(() => {
    if (!state) return [];
    const base =
      view === "current"
        ? state.events.filter((event) => event.tabId === state.activeTabId)
        : state.events;
    const query = filter.trim().toLocaleLowerCase();
    return query
      ? base.filter((event) => event.query.toLocaleLowerCase().includes(query))
      : base;
  }, [filter, state, view]);

  const estimate = async (eventId: string) => {
    setLoadingId(eventId);
    setError(null);
    const response = await message({
      type: "openqueries:estimate-fan-outs",
      eventId,
    });
    if (!response.ok) setError(response.error);
    else if (response.state) setState(response.state);
    setLoadingId(null);
  };

  const setDonation = async (enabled: boolean) => {
    const response = await message({
      type: "openqueries:set-donation",
      enabled,
    });
    if (response.ok && response.state) setState(response.state);
  };

  const clearLocal = async () => {
    if (!window.confirm("Delete the complete local Open Queries history?"))
      return;
    const response = await message({ type: "openqueries:clear-local-history" });
    if (response.ok && response.state) setState(response.state);
  };

  const removeDonations = async () => {
    if (
      !window.confirm(
        "Delete all server-side donations from this installation?",
      )
    )
      return;
    const response = await message({ type: "openqueries:delete-donations" });
    if (!response.ok) setError(response.error);
    else if (response.state) setState(response.state);
  };

  return (
    <main className="panel-shell">
      <header className="panel-header">
        <a
          className="brand"
          href="https://openqueries.org"
          target="_blank"
          rel="noreferrer"
        >
          <span className="brand-mark">
            <OpenQueriesMark size={17} />
          </span>
          <span>Open Queries</span>
        </a>
        <span
          className={`donation-status ${state?.donationEnabled && state.onboardingAcknowledged ? "active" : ""}`}
        >
          <i />{" "}
          {state?.donationEnabled && state.onboardingAcknowledged
            ? "Donating"
            : "Local only"}
        </span>
      </header>

      {view !== "settings" ? (
        <div className="panel-context">
          <div>
            <p>{view === "current" ? "Live query trace" : "Local history"}</p>
            <h1>
              {view === "current"
                ? "What the model searched"
                : "Queries from the last 30 days"}
            </h1>
          </div>
          <span>{events.length}</span>
        </div>
      ) : null}

      {view === "history" ? (
        <label className="search-field">
          <Search size={15} />
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter queries"
          />
        </label>
      ) : null}

      {error ? (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      ) : null}

      <section className="panel-content">
        {view === "settings" ? (
          <div className="settings-view">
            <div className="settings-heading">
              <p>Privacy and storage</p>
              <h1>You control the trace.</h1>
              <span>
                Chat messages never enter the Open Queries data contract.
              </span>
            </div>
            <div className="setting-row">
              <div>
                <strong>Donate observed queries</strong>
                <span>
                  Contribute model web searches and the disclosed Google Search
                  exception.
                </span>
              </div>
              <button
                className={`switch ${state?.donationEnabled ? "on" : ""}`}
                role="switch"
                aria-checked={state?.donationEnabled}
                onClick={() => void setDonation(!state?.donationEnabled)}
              >
                <i />
              </button>
            </div>
            <div className="setting-row stacked">
              <div>
                <strong>Local history</strong>
                <span>Automatically limited to 30 days and 2,000 events.</span>
              </div>
              <button
                className="secondary-button danger"
                onClick={() => void clearLocal()}
              >
                <Trash2 size={14} /> Delete local history
              </button>
            </div>
            <div className="setting-row stacked">
              <div>
                <strong>Server donations</strong>
                <span>
                  Delete events linked to this installation and rotate its
                  anonymous donor ID.
                </span>
              </div>
              <button
                className="secondary-button"
                onClick={() => void removeDonations()}
              >
                <Database size={14} /> Delete my donations
              </button>
            </div>
            <div className="settings-links">
              <a
                href="https://openqueries.org/methodology"
                target="_blank"
                rel="noreferrer"
              >
                Methodology ↗
              </a>
              <a
                href="https://openqueries.org/privacy"
                target="_blank"
                rel="noreferrer"
              >
                Privacy ↗
              </a>
              <a
                href="https://github.com/openqueries/openqueries"
                target="_blank"
                rel="noreferrer"
              >
                Source code ↗
              </a>
            </div>
          </div>
        ) : events.length ? (
          <div className="query-list">
            {events.map((event) => (
              <QueryCard
                key={event.eventId}
                event={event}
                loading={loadingId === event.eventId}
                onEstimate={(id) => void estimate(id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState current={view === "current"} />
        )}
      </section>

      <nav className="panel-nav" aria-label="Open Queries views">
        <button
          className={view === "current" ? "active" : ""}
          onClick={() => setView("current")}
        >
          <Activity size={17} />
          <span>Current</span>
        </button>
        <button
          className={view === "history" ? "active" : ""}
          onClick={() => setView("history")}
        >
          <History size={17} />
          <span>History</span>
        </button>
        <button
          className={view === "settings" ? "active" : ""}
          onClick={() => setView("settings")}
        >
          <Settings size={17} />
          <span>Settings</span>
        </button>
      </nav>
    </main>
  );
}
