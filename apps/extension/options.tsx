import { useEffect, useState } from "react";
import { Check, ExternalLink, ShieldCheck } from "lucide-react";
import { OpenQueriesMark } from "@openqueries/provider-icons";

import type { RuntimeResponse } from "./lib/types";
import "./style.css";

export default function OptionsPage() {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    void chrome.runtime
      .sendMessage({ type: "openqueries:get-state" })
      .then((response: RuntimeResponse) => {
        if (response.ok && response.state) {
          setPrivacyAccepted(response.state.privacyAccepted);
        }
      });
  }, []);

  const continueToExtension = async () => {
    const response = (await chrome.runtime.sendMessage({
      type: "openqueries:set-privacy",
      accepted: privacyAccepted,
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
          services. Accept the privacy setting to view them and use fan-out
          estimates.
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
        <label className="privacy-choice">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(event) => setPrivacyAccepted(event.target.checked)}
          />
          <span>
            <strong>Accept privacy settings</strong>
            <small>
              Every eligible web-search query—not chats—is sent to Open Queries.
              Acceptance unlocks the query trace and fan-out estimates and can
              be switched off at any time.
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
