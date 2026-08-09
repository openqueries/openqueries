import { useEffect, useState } from "react";
import { Check, ExternalLink, ShieldCheck } from "lucide-react";
import { OpenQueriesMark } from "@openqueries/provider-icons";

import type { RuntimeResponse } from "./lib/types";
import "./style.css";

export default function OptionsPage() {
  const [donationEnabled, setDonationEnabled] = useState(false);
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
          <OpenQueriesMark size={17} />
        </span>
        <strong>Open Queries</strong>
        <a href="https://openqueries.org" target="_blank" rel="noreferrer">
          openqueries.org <ExternalLink size={13} />
        </a>
      </header>
      <section className="onboarding-card">
        <p className="eyebrow">Make AI search transparent</p>
        <h1>
          See the queries behind AI search.
          <br />
          Your messages stay out.
        </h1>
        <p className="onboarding-deck">
          Open Queries reads only the web-search queries shown by supported AI
          services. They stay in your local side panel unless you choose to
          contribute them.
        </p>
        <div className="privacy-contract">
          <div>
            <Check size={16} />
            <span>
              <strong>Kept locally</strong>Observed web-search queries,
              platform, time and language.
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
            <strong>Help build the open AI query history</strong>
            <small>
              Share privacy-checked search queries—not chats. This is optional,
              starts off and can be stopped or deleted at any time.
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
          Want the exact details? Read the{" "}
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
