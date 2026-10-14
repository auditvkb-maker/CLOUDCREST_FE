import { useMemo } from "react";
import { Check, Info } from "lucide-react";
import { activityForNic, useActivities } from "@/lib/nice-activities";

/**
 * "What will your company mainly do?" as a list of activities, or a NIC code typed instead.
 * Either one tells the trade mark check which classes are the business's own. A typed NIC code
 * picks the matching activity for you (the longest matching code prefix wins); if it matches
 * nothing the applicant is asked to choose from the list.
 *
 * Controlled: `value` is the activity's id (empty = not sure) and `nic` the typed code.
 */
export function ActivityPicker({
  value,
  nic,
  onChange,
  idPrefix = "act",
  compact = false,
}: {
  value: string;
  nic: string;
  onChange: (next: { activityId: string; nic: string }) => void;
  idPrefix?: string;
  compact?: boolean;
}) {
  const activities = useActivities();
  const fromNic = useMemo(() => activityForNic(nic, activities), [nic, activities]);
  const digits = nic.replace(/\D/g, "");
  const typed = digits.length >= 2;

  const field = "h-10 rounded-lg border border-border bg-white px-3 text-sm";

  return (
    <div>
      <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "mt-2"}`}>
        <select
          id={`${idPrefix}-activity`}
          aria-label="Business activity"
          value={value}
          onChange={(e) => onChange({ activityId: e.target.value, nic: "" })}
          className={`${field} max-w-full`}
        >
          <option value="">Not sure / any business</option>
          {activities.map((a) => (
            <option key={String(a.id)} value={String(a.id)}>
              {a.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">or</span>
        <input
          id={`${idPrefix}-nic`}
          aria-label="NIC code"
          inputMode="numeric"
          maxLength={6}
          value={nic}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            const match = activityForNic(v, activities);
            // A recognised code selects its activity; a half-typed one leaves the choice alone.
            onChange({ activityId: match ? String(match.id) : v.length < 2 ? value : "", nic: v });
          }}
          placeholder="NIC code, e.g. 62011"
          className={`${field} w-44`}
        />
      </div>
      {typed && (
        <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${fromNic ? "text-success" : "text-muted-foreground"}`}>
          {fromNic ? <Check className="size-3.5" /> : <Info className="size-3.5" />}
          {fromNic
            ? `NIC ${digits} is “${fromNic.label}”.`
            : digits.length < 4
              ? "Keep typing, or choose an activity from the list."
              : `We don't have NIC ${digits} yet. Please choose the closest activity from the list.`}
        </p>
      )}
    </div>
  );
}
