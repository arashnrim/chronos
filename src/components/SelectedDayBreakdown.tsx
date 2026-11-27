import { PeopleList, PeopleListLoading } from "@components/PeopleList";
import { Button } from "@components/ui/Button";
import type { Attendance } from "@utils/attendance";
import { capacityLevelColors, getCapacityLevel } from "@utils/attendance";
import { Badge } from "./ui/Badge";
import { Skeleton } from "./ui/Skeleton";

const PeriodSummaries = ({
  attendance,
  totalPeople,
}: {
  attendance: Attendance | null;
  totalPeople: number;
}) => {
  return (
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
      {(["AM", "PM"] as const).map((period) => {
        const peopleIn = attendance?.periods[period].peopleIn.length;
        const peopleOut = attendance?.periods[period].peopleOut.length;
        const inCapacityLevel = getCapacityLevel(peopleIn ?? 0, totalPeople);

        return (
          <div key={period} className="flex items-center gap-2">
            <Badge variant="secondary">{period}</Badge>
            {peopleIn === undefined ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <div className="flex flex-col gap-0.5">
                <span
                  className={
                    inCapacityLevel
                      ? capacityLevelColors[inCapacityLevel]
                      : "text-muted-foreground"
                  }
                >
                  {peopleIn} of {totalPeople} in
                </span>
                <span className={"text-muted-foreground"}>
                  {peopleOut} of {totalPeople} out
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const SelectedDayBreakdown = ({
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
}) => {
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
        <>
          <PeriodSummaries attendance={null} totalPeople={totalPeople} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <PeopleListLoading variant="in" />
            <PeopleListLoading variant="out" />
          </div>
        </>
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
          {totalPeople > 0 && (
            <PeriodSummaries
              attendance={attendance}
              totalPeople={totalPeople}
            />
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <PeopleList variant="in" people={attendance.peopleIn} />
            <PeopleList variant="out" people={attendance.peopleOut} />
          </div>
        </>
      )}
    </div>
  );
};
