import { PeopleList, PeopleListLoading } from "@components/PeopleList";
import { Button } from "@components/ui/Button";
import type { Attendance } from "@utils/attendance";
import { getCapacityLevel } from "@utils/attendance";

export function SelectedDayBreakdown({
  selected,
  status,
  attendance,
  totalPeople,
  onRetry,
}: {
  selected: Date;
  status: "loading" | "error" | "ready";
  attendance: Attendance | null;
  totalPeople: number;
  onRetry: () => void;
}) {
  const capacityLevel = attendance
    ? getCapacityLevel(attendance.peopleIn.length, totalPeople)
    : null;

  return (
    <div className="mt-8" aria-live="polite">
      <h2 className="text-xl font-bold">
        {selected.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </h2>
      {status === "loading" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <PeopleListLoading variant="in" />
          <PeopleListLoading variant="out" />
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm text-destructive">
            Cannot load attendance, die liao
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
      {status === "ready" && attendance && (
        <>
          {totalPeople === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              No one's configured yet
            </p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <PeopleList
              variant="in"
              people={attendance.peopleIn}
              capacityLevel={capacityLevel}
            />
            <PeopleList variant="out" people={attendance.peopleOut} />
          </div>
        </>
      )}
    </div>
  );
}
