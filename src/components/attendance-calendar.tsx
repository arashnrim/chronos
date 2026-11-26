import { useState } from "react";
import { Button } from "@root/src/components/ui/button";
import { AttendanceCalendarGrid } from "./attendance-calendar-grid";
import { PeopleList } from "./people-list";
import { useAttendanceData } from "./use-attendance-data";
import { getAttendance, nextWeekday } from "@utils/attendance";

export default function AttendanceCalendar() {
  const [selected, setSelected] = useState(() => nextWeekday(new Date()));
  const [month, setMonth] = useState(() => new Date(selected));
  const [secretInput, setSecretInput] = useState("");
  const { state, retry, connect } = useAttendanceData(month);

  const data = state.status === "ready" ? state.data : null;
  const attendance = data
    ? getAttendance(selected, data.people, data.events)
    : null;

  return (
    <>
      <AttendanceCalendarGrid
        data={data}
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
        <h2 className="text-lg font-semibold">
          {selected.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h2>
        {state.status === "loading" && (
          <p className="mt-4 text-sm text-muted-foreground">
            Loading attendance...
          </p>
        )}
        {state.status === "error" && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm text-destructive">
              Could not load attendance.
            </p>
            <Button variant="outline" size="sm" onClick={retry}>
              Retry
            </Button>
          </div>
        )}
        {state.status === "unauthorized" && (
          <form
            className="mt-4 flex flex-wrap items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              connect(secretInput);
            }}
          >
            <p className="w-full text-sm text-muted-foreground">
              Enter a valid API secret to load attendance.
            </p>
            <label className="grid gap-2 text-sm font-medium">
              API secret
              <input
                className="h-9 rounded-md border bg-background px-3 font-normal"
                type="password"
                value={secretInput}
                onChange={(event) => setSecretInput(event.target.value)}
                required
              />
            </label>
            <Button type="submit" size="sm">
              Connect
            </Button>
          </form>
        )}
        {attendance && data && (
          <>
            {data.people.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                No people configured.
              </p>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <PeopleList title="People in" people={attendance.peopleIn} />
              <PeopleList title="People out" people={attendance.peopleOut} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
