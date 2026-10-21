export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/70 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:gap-4 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Stryde. All rights reserved.</p>
        <span className="hidden sm:inline" aria-hidden="true">
          ·
        </span>
        <p className="text-center">
          Results sourced from public web data via Firecrawl and Hunter.
        </p>
      </div>
    </footer>
  );
}
