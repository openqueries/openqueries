import { useEffect, useState } from "react";
import { Activity, Check, ExternalLink, ShieldCheck } from "lucide-react";

import type { RuntimeResponse } from "./lib/types";
import "./style.css";

export default function OptionsPage() {
  const [donationEnabled, setDonationEnabled] = useState(true);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    void chrome.runtime
      .sendMessage({ type: "openqueries:get-state" })
      .then((response: RuntimeResponse) => {
        if (response.ok && response.state) {
          setDonationEnabled(response.state.donationEnabled);
          setComplete(response.state.onboardingAcknowledged);
        }
      });
  }, []);

  const continueToExtension = async () => {
    const response = (await chrome.runtime.sendMessage({
      type: "openqueries:acknowledge-onboarding",
      donationEnabled,
    })) as RuntimeResponse;
    if (response.ok) setComplete(true);
  };

  return (
    <main className="onboarding-shell">
      <header className="onboarding-header">
        <span className="brand-mark">
          <Activity size={16} />
        </span>
        <strong>Open Queries</strong>
        <a href="https://openqueries.org" target="_blank" rel="noreferrer">
          openqueries.org <ExternalLink size={13} />
        </a>
      </header>
      <section className="onboarding-card">
        <p className="eyebrow">Make AI search transparent</p>
        <h1>
          See what the model searches.
          <br />
          Share only what matters.
        </h1>
        <p className="onboarding-deck">
          Open Queries records explicitly surfaced web-search queries from
          ChatGPT and Claude, plus your clearly disclosed Google Search seed. It
          never records chat messages.
        </p>
        <div className="privacy-contract">
          <div>
            <Check size={16} />
            <span>
              <strong>Collected</strong>Observed web-search queries, platform,
              time and language.
            </span>
          </div>
          <div>
            <ShieldCheck size={16} />
            <span>
              <strong>Never collected</strong>Chat messages, conversation
              titles, chat URLs or account identity.
            </span>
          </div>
        </div>
        <label className="donation-choice">
          <input
            type="checkbox"
            checked={donationEnabled}
            onChange={(event) => setDonationEnabled(event.target.checked)}
          />
          <span>
            <strong>Contribute observed queries</strong>
            <small>
              On by default. Turn it off now or at any time in Settings. Raw
              events expire after 13 months.
            </small>
          </span>
        </label>
        {complete ? (
          <div className="onboarding-complete">
            <Check size={18} /> Setup complete. Click the Open Queries toolbar
            icon to open the side panel.
          </div>
        ) : (
          <button
            className="primary-button"
            onClick={() => void continueToExtension()}
          >
            Continue to Open Queries
          </button>
        )}
        <p className="legal-note">
          Continuing acknowledges the data notice. Read the{" "}
          <a
            href="https://openqueries.org/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="https://openqueries.org/methodology"
            target="_blank"
            rel="noreferrer"
          >
            Methodology
          </a>
          .
        </p>
      </section>
    </main>
  );
}
