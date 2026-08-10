import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { ContentSection, ContentSource, RelatedLink } from "@/lib/content";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        {items.map((item) => (
          <li key={`${item.href || "current"}-${item.label}`}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              item.label
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ArticleToc({ sections }: { sections: ContentSection[] }) {
  return (
    <aside className="article-toc" aria-label="On this page">
      <strong>On this page</strong>
      <ol>
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.heading}</a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

export function DirectAnswer({ children }: { children: string }) {
  return (
    <aside className="direct-answer" aria-label="Direct answer">
      <strong>Direct answer</strong>
      <p>{children}</p>
    </aside>
  );
}

export function ContentSections({ sections }: { sections: ContentSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <section id={section.id} key={section.id}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.bullets?.length ? (
            <ul>
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
          {section.steps?.length ? (
            <ol className="content-steps">
              {section.steps.map((step, index) => (
                <li key={step.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
          {section.table ? (
            <div className="evidence-table" role="region" tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    {section.table.headers.map((header) => (
                      <th key={header} scope="col">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row) => (
                    <tr key={row.join("|")}>
                      {row.map((cell, index) =>
                        index === 0 ? (
                          <th key={cell} scope="row">
                            {cell}
                          </th>
                        ) : (
                          <td key={`${index}-${cell}`}>{cell}</td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {section.example ? (
            <aside className="content-example">
              <strong>{section.example.title}</strong>
              <dl>
                <div>
                  <dt>Input</dt>
                  <dd>{section.example.input}</dd>
                </div>
                <div>
                  <dt>Output</dt>
                  <dd>{section.example.output}</dd>
                </div>
              </dl>
              <p>{section.example.note}</p>
            </aside>
          ) : null}
          {section.equations?.length ? (
            <div className="article-equations">
              {section.equations.map((equation) => (
                <code key={equation}>{equation}</code>
              ))}
            </div>
          ) : null}
          {section.callout ? (
            <aside className="content-callout">{section.callout}</aside>
          ) : null}
        </section>
      ))}
    </>
  );
}

export function SourceList({ sources }: { sources: ContentSource[] }) {
  return (
    <section className="source-list" id="sources">
      <h2>Primary sources</h2>
      <ul>
        {sources.map((source) => (
          <li key={source.url}>
            <a href={source.url}>{source.label}</a>
            <span>
              {source.publisher} · accessed {source.accessedAt}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RelatedLinks({ links }: { links: RelatedLink[] }) {
  return (
    <section className="related-links">
      <h2>Continue exploring</h2>
      <div>
        {links.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label} <span>↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function InstallCta() {
  return (
    <aside className="install-inline-cta">
      <div>
        <span>Open-source AI search query inspector</span>
        <strong>See the retrieval queries beside the AI answer.</strong>
      </div>
      <Link href="/install">
        Install Open Queries <ArrowRight size={14} />
      </Link>
    </aside>
  );
}
