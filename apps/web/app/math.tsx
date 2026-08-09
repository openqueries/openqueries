import katex from "katex";

export function DisplayMath({ children }: { children: string }) {
  return (
    <div
      className="display-math"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(children, {
          displayMode: true,
          output: "htmlAndMathml",
          strict: "error",
          throwOnError: true,
          trust: false,
        }),
      }}
    />
  );
}

export function InlineMath({ children }: { children: string }) {
  return (
    <span
      className="inline-math"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(children, {
          displayMode: false,
          output: "htmlAndMathml",
          strict: "error",
          throwOnError: true,
          trust: false,
        }),
      }}
    />
  );
}
