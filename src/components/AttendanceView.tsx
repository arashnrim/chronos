import { AuthPopup } from "@components/AuthPopup";
import { SelectedDayBreakdown } from "@components/SelectedDayBreakdown";
import { useAttendanceData } from "@hooks/useAttendanceData";
import { AttendanceCalendar } from "@root/src/components/AttendanceCalendar";
import { getAttendance, nextWeekday } from "@utils/attendance";
import { useEffect, useState } from "react";

const AttendanceView = () => {
  const [selected, setSelected] = useState(() => nextWeekday(new Date()));
  const [month, setMonth] = useState(() => new Date(selected));
  const { state, retry } = useAttendanceData(month);
  const [authAttempt, setAuthAttempt] = useState<number | null>(null);

  useEffect(() => {
    if (state.status === "unauthorized") {
      setAuthAttempt(state.attempt);
    } else if (state.status === "ready") {
      setAuthAttempt(null);
    }
  }, [state]);

  const data = state.status === "ready" ? state.data : null;
  const attendance = data
    ? getAttendance(selected, data.people, data.events)
    : null;

  return (
    <>
      {authAttempt !== null && (
        <AuthPopup attempt={authAttempt} onRetry={retry} />
      )}
      <AttendanceCalendar
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

      <SelectedDayBreakdown
        selected={selected}
        status={state.status === "unauthorized" ? "loading" : state.status}
        attendance={attendance}
        totalPeople={data?.people.length ?? 0}
        onRetry={retry}
      />
    </>
  );
};

export default AttendanceView;
