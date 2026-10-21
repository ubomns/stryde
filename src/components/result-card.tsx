import {
  MapPin,
  Monitor,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Lead } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ContactRow } from "@/components/contact-row";
import { isSafeWebUrl } from "@/lib/utils";

interface ResultCardProps {
  lead: Lead;
  isLast?: boolean;
}

function typeBadgeVariant(type: string) {
  if (type === "job") return "jobs" as const;
  if (type === "client" || type === "lead") return "leads" as const;
  if (type === "both") return "both" as const;
  return "default" as const;
}

function typeBadgeLabel(type: string) {
  if (type === "job") return "Job";
  if (type === "client" || type === "lead") return "Lead";
  if (type === "both") return "Both";
  return type || "Result";
}

function priorityBadgeVariant(priority: string) {
  const p = priority.toLowerCase();
  if (p === "high") return "high" as const;
  if (p === "medium") return "medium" as const;
  return "low" as const;
}

export function ResultCard({ lead, isLast }: ResultCardProps) {
  const hasContacts = Array.isArray(lead.contacts) && lead.contacts.length > 0;

  return (
    <article
      className={`group rounded-2xl border border-transparent py-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-100 hover:bg-slate-50/70 hover:shadow-md ${
        isLast ? "" : "border-b border-slate-200/70 hover:border-b-indigo-100"
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={typeBadgeVariant(lead.type)}>
              {typeBadgeLabel(lead.type)}
            </Badge>
            {lead.priority && (
              <Badge variant={priorityBadgeVariant(lead.priority)}>
                {lead.priority}
              </Badge>
            )}
          </div>
          {lead.source_url && isSafeWebUrl(lead.source_url) && (
            <a
              href={lead.source_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open source link in a new tab"
              className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-lg text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Source</span>
            </a>
          )}
        </div>

        {lead.opportunity && (
          <h3 className="text-lg font-semibold leading-snug text-slate-900">
            {lead.opportunity}
          </h3>
        )}

        {(lead.company || lead.domain) && (
          <p className="text-sm text-slate-600">
            {lead.company}
            {lead.company && lead.domain && " · "}
            {lead.domain}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
          {lead.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-slate-400" aria-hidden="true" />
              {lead.location}
            </span>
          )}
          {(lead.remote_status || lead.remote || lead.remote_preference) && (
            <span className="inline-flex items-center gap-1.5">
              <Monitor className="size-4 text-slate-400" aria-hidden="true" />
              {lead.remote_status || lead.remote || lead.remote_preference}
            </span>
          )}
          {lead.posted_date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4 text-slate-400" aria-hidden="true" />
              {lead.posted_date}
            </span>
          )}
          {typeof lead.days_old === "number" && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-slate-400" aria-hidden="true" />
              {lead.days_old} days old
            </span>
          )}
        </div>

        {lead.why_it_fits && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Why it fits
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              {lead.why_it_fits}
            </p>
          </div>
        )}

        {hasContacts && (
          <div className="flex flex-col gap-3 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Contacts
            </p>
            <div className="flex flex-col">
              {lead.contacts!.map((contact, i) => (
                <ContactRow
                  key={`contact-${i}-${contact.name}-${contact.email || contact.linkedin_url || "none"}`}
                  contact={contact}
                  isLast={i === lead.contacts!.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
