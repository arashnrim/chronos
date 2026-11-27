import { AttendanceCalendarGrid } from "@components/attendance-calendar-grid";
import { PeopleList, PeopleListLoading } from "@components/people-list";
import { Button } from "@components/ui/button";
import { useAttendanceData } from "@components/use-attendance-data";
import {
  getAttendance,
  getCapacityLevel,
  nextWeekday,
} from "@utils/attendance";
import { useState } from "react";

export default function AttendanceCalendar() {
  const [selected, setSelected] = useState(() => nextWeekday(new Date()));
  const [month, setMonth] = useState(() => new Date(selected));
  const { state, retry } = useAttendanceData(month);

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
        {state.status === "loading" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <PeopleListLoading variant="in" />
            <PeopleListLoading variant="out" />
          </div>
        )}
        {(state.status === "error" || state.status === "unauthorized") && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p
              className={
                state.status === "error"
                  ? "text-sm text-destructive"
                  : "text-sm text-muted-foreground"
              }
            >
              {state.status === "error"
                ? "Could not load attendance."
                : "Halt! Who goes there? Enter your name and the password to continue."}
            </p>
            <Button variant="outline" size="sm" onClick={retry}>
              {state.status === "unauthorized" ? "Enter password" : "Retry"}
            </Button>
          </div>
        )}
        {attendance && data && (
          <>
            {data.people.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                No people configured.
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
