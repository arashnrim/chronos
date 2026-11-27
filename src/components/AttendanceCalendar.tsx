import { AttendanceCalendarGrid } from "@root/src/components/AttendanceCalendarGrid";
import { PeopleList, PeopleListLoading } from "@root/src/components/PeopleList";
import { Button } from "@root/src/components/ui/Button";
import { useAttendanceData } from "@root/src/hooks/useAttendanceData";
import {
  getAttendance,
  getCapacityLevel,
  nextWeekday,
} from "@utils/attendance";
import { useEffect, useState } from "react";

export default function AttendanceCalendar() {
  const [selected, setSelected] = useState(() => nextWeekday(new Date()));
  const [month, setMonth] = useState(() => new Date(selected));
  const { state, retry } = useAttendanceData(month);

  useEffect(() => {
    if (state.status === "unauthorized") {
      window.dispatchEvent(
        new CustomEvent("chronos:auth-required", {
          detail: { attempt: state.attempt },
        }),
      );
    } else if (state.status === "ready") {
      window.dispatchEvent(new Event("chronos:auth-restored"));
    }
  }, [state]);

  useEffect(() => {
    const handleAuthRetry = () => retry();
    window.addEventListener("chronos:auth-retry", handleAuthRetry);
    return () =>
      window.removeEventListener("chronos:auth-retry", handleAuthRetry);
  }, [retry]);

  const data = state.status === "ready" ? state.data : null;
  const attendance = data
    ? getAttendance(selected, data.people, data.events)
    : null;
  const capacityLevel =
    attendance && data
      ? getCapacityLevel(attendance.peopleIn.length, data.people.length)
      : null;

  return (
    <>
      <AttendanceCalendarGrid
        data={data}
        isLoading={state.status === "loading"}
        selected={selected}
        onSelect={setSelected}
        month={month}
        onMonthChange={(nextMonth) => {
          setMonth(nextMonth);
          setSelected(
            nextWeekday(
              new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1),
            ),
          );
        }}
      />

      <div className="mt-8" aria-live="polite">
        <h2 className="text-xl font-bold">
          {selected.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h2>
        {(state.status === "loading" || state.status === "unauthorized") && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <PeopleListLoading variant="in" />
            <PeopleListLoading variant="out" />
          </div>
        )}
        {state.status === "error" && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm text-destructive">
              Cannot load attendance, die liao
            </p>
            <Button variant="outline" size="sm" onClick={retry}>
              Retry
            </Button>
          </div>
        )}
        {attendance && data && (
          <>
            {data.people.length === 0 && (
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
              <PeopleList
                variant="out"
                people={attendance.peopleOut}
                capacityLevel={capacityLevel}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
