import { PeopleList, PeopleListLoading } from "@components/PeopleList";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Skeleton } from "@components/ui/Skeleton";
import AttendanceContext from "@contexts/AttendanceContext";
import {
  capacityLevelColors,
  getAttendance,
  getCapacityLevel,
} from "@utils/attendance";
import { useContext } from "react";

const PeriodSummaries = ({ selectedDate }: { selectedDate: Date }) => {
  const { data } = useContext(AttendanceContext);
  const attendance = data
    ? getAttendance(selectedDate, data.people, data.events)
    : null;
  const totalPeople = data?.people.length ?? 0;

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

export const SelectedDateBreakdown = ({
  selectedDate,
  onRetry,
}: {
  selectedDate: Date;
  onRetry: () => void;
}) => {
  const { state, data } = useContext(AttendanceContext);
  const attendance = data
    ? getAttendance(selectedDate, data.people, data.events)
    : null;
  const totalPeople = data?.people.length ?? 0;

  return (
    <div className="mt-8" aria-live="polite">
      <h2 className="text-xl font-bold">
        {selectedDate.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </h2>
      {(state.status === "loading" || state.status === "unauthorized") && (
        <>
          <PeriodSummaries selectedDate={selectedDate} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <PeopleListLoading variant="in" />
            <PeopleListLoading variant="out" />
          </div>
        </>
      )}
      {state.status === "error" && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm text-destructive">
            Cannot load attendance, die liao
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
      {state.status === "ready" && attendance && (
        <>
          {totalPeople === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              No one's configured yet
            </p>
          )}
          {totalPeople > 0 && <PeriodSummaries selectedDate={selectedDate} />}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <PeopleList variant="in" people={attendance.peopleIn} />
            <PeopleList variant="out" people={attendance.peopleOut} />
          </div>
        </>
      )}
    </div>
  );
};
