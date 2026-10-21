import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search, Workflow, Shield, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "About — Stryde",
  description:
    "What this demo does, where the data comes from, and how your privacy is protected.",
};

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <article className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6 lg:py-20">
        <Link
          href="/"
          className="group inline-flex h-11 items-center gap-1.5 rounded-md px-1 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft
            className="size-4 transition-transform duration-150 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Back to search
        </Link>

        <header className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            About this demo
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Find your next role or prospect
          </h1>
        </header>

        <div className="mt-8 space-y-8 text-base leading-relaxed text-slate-700">
          <section>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Search className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              What this demo does
            </h2>
            <p className="mt-2">
              This is a portfolio demo that turns a plain-English request into
              curated job postings or sales leads. Choose between Jobs, Leads,
              or Both, describe what you are looking for, and the backend
              returns a batch of relevant opportunities with source links and
              verified contacts where available.
            </p>
          </section>

          <section>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Workflow className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              How it works
            </h2>
            <p className="mt-2">
              Your query is sent to a self-hosted n8n workflow. The workflow
              uses{" "}
              <span className="font-medium text-slate-900">Firecrawl</span> for
              web search and scraping, and{" "}
              <span className="font-medium text-slate-900">Hunter</span> for
              domain and email verification. The results are returned as a
              structured batch, which this interface renders into scannable
              cards.
            </p>
          </section>

          <section>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Shield className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Data & privacy
            </h2>
            <p className="mt-2">
              Results are sourced from public web data. No account is required,
              and we do not store your queries or results on our servers. The
              demo is intentionally minimal: there is no auth, no payment, and
              no persistent user tracking.
            </p>
          </section>

          <section>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Layers className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Stack credits
            </h2>
            <p className="mt-2">
              Built with{" "}
              <span className="font-medium text-slate-900">Next.js</span>,{" "}
              <span className="font-medium text-slate-900">React</span>,{" "}
              <span className="font-medium text-slate-900">TypeScript</span>,{" "}
              <span className="font-medium text-slate-900">Tailwind CSS</span>,{" "}
              and{" "}
              <span className="font-medium text-slate-900">shadcn/ui</span>. The
              automation layer runs on{" "}
              <span className="font-medium text-slate-900">n8n</span> and the
              project is deployed on{" "}
              <span className="font-medium text-slate-900">Vercel</span>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
