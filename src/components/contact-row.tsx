import { Mail, Linkedin } from "lucide-react";
import { Contact } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { isSafeMailto, isSafeWebUrl } from "@/lib/utils";

interface ContactRowProps {
  contact: Contact;
  isLast?: boolean;
}

function emailStatusVariant(status?: string): "valid" | "invalid" | "default" {
  if (status === "valid") return "valid";
  if (status === "invalid") return "invalid";
  return "default";
}

function emailStatusLabel(status?: string): string {
  if (status === "valid") return "Verified";
  if (status === "invalid") return "Invalid";
  return "Unverified";
}

export function ContactRow({ contact, isLast }: ContactRowProps) {
  const emailInvalid = contact.email_status === "invalid";

  return (
    <div
      className={`flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between ${
        isLast ? "" : "border-b border-slate-100"
      }`}
    >
      <p className="text-sm font-medium text-slate-900">
        {contact.name}
        {contact.title && (
          <span className="font-normal text-slate-500">, {contact.title}</span>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {contact.email && (
          <div className="flex flex-wrap items-center gap-2">
            <Mail className="size-4 text-slate-400" aria-hidden="true" />
            {emailInvalid || !isSafeMailto(contact.email) ? (
              <span className="text-sm text-slate-700">{contact.email}</span>
            ) : (
              <a
                href={`mailto:${encodeURIComponent(contact.email)}`}
                className="inline-flex h-11 items-center rounded-md px-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50 hover:text-indigo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                {contact.email}
              </a>
            )}
            <Badge variant={emailStatusVariant(contact.email_status)}>
              {emailStatusLabel(contact.email_status)}
            </Badge>
          </div>
        )}

        {contact.linkedin_url && isSafeWebUrl(contact.linkedin_url) && (
          <a
            href={contact.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-1.5 rounded-md px-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50 hover:text-indigo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <Linkedin className="size-4" aria-hidden="true" />
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}
