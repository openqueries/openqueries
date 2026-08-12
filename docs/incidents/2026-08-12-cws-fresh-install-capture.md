# Chrome Web Store fresh-install capture incident

Date: 2026-08-12  
Affected release: 1.0.5  
Corrected release: 1.0.6

## Impact

Chrome Web Store review could not reproduce ChatGPT or Claude query capture and
History. Version 1.0.5 was rejected as non-functional. The previous release gate
did not model a completely fresh browser installation, so it incorrectly passed.

## Root cause

ChatGPT and Claude need a page-main-world observer at `document_start` plus an
isolated extension bridge. The source declared the observer through Plasmo's
content-script mechanism with `world: "MAIN"`, but the Plasmo manifest transformer
did not preserve that field in the static Manifest V3 content-script entry. It
instead emitted service-worker code that dynamically registered the main-world
scripts.

That made capture depend on service-worker startup and successful runtime
registration. Existing development profiles could retain dynamically registered
scripts, while a fresh reviewer installation had no such state. The build test
mocked this registration path and therefore proved the mock rather than the
installable package.

## Correction

- The ChatGPT and Claude main-world observers are now explicit static manifest
  entries with `world: "MAIN"` and `run_at: "document_start"`.
- The final manifest is normalized after Plasmo emits hashed bundle filenames.
- Runtime content-script registration, reinjection and the `scripting` permission
  were removed.
- The final manifest test rejects any service worker containing
  `registerContentScripts` or `chrome.scripting`.
- The release build is installed into a new temporary Chrome-for-Testing profile.
  The test enables privacy, captures one explicit transport query from each
  provider, verifies both in the rendered History view, then switches the active
  provider tab and verifies the provider-specific Current view.
- The test profile uses `--password-store=basic` and `--use-mock-keychain`; it
  never uses the developer's normal browser profile or Keychain.

## Release rule

No Chrome package may be uploaded unless the final ZIP-equivalent build passes
the fresh-install browser test. A mock-only service-worker test is not sufficient
evidence for provider capture or History.
