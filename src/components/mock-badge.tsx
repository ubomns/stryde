import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MockBadge() {
  return (
    <Badge
      variant="warning"
      className="inline-flex items-center gap-1.5 rounded-full"
    >
      <FlaskConical className="size-3" aria-hidden="true" />
      Demo data
    </Badge>
  );
}
