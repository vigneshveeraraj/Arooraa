import type { ActivityEntry } from "@/lib/admin/types";
import { humanizeStatus } from "@/components/admin/LeadStatusBadge";
import styles from "./panels.module.css";
import timelineStyles from "./ActivityTimeline.module.css";

const ACTIVITY_LABELS: Record<string, string> = {
  STATUS_CHANGED: "Status changed",
  FOLLOW_UP_SET: "Follow-up set",
  ASSIGNED_CHANGED: "Assignment changed",
  ESTIMATED_VALUE_SET: "Estimated value set",
  NOTE_ADDED: "Note added",
};

function describe(entry: ActivityEntry): string {
  const label = ACTIVITY_LABELS[entry.activityType] ?? humanizeStatus(entry.activityType);
  if (entry.activityType === "NOTE_ADDED") return label;
  if (entry.oldValue && entry.newValue) return `${label}: ${entry.oldValue} → ${entry.newValue}`;
  if (entry.newValue) return `${label}: ${entry.newValue}`;
  return label;
}

export function ActivityTimeline({ activity }: { activity: ActivityEntry[] }) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Activity Timeline</h2>
      {activity.length === 0 ? (
        <p className={timelineStyles.empty}>No activity yet.</p>
      ) : (
        <ol className={timelineStyles.list}>
          {activity.map((entry) => (
            <li key={entry.id} className={timelineStyles.entry}>
              <span className={timelineStyles.dot} aria-hidden="true" />
              <div>
                <p className={timelineStyles.description}>{describe(entry)}</p>
                <p className={timelineStyles.meta}>
                  {entry.actorName} · {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
