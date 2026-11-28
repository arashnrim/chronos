import { AuthPopup } from "@components/AuthPopup";
import AttendanceContext from "@contexts/AttendanceContext";
import { useAttendanceData } from "@hooks/useAttendanceData";
import { AttendanceCalendar } from "@root/src/components/AttendanceCalendar";
import { SelectedDateBreakdown } from "@root/src/components/SelectedDateBreakdown";
import { nextWeekday } from "@utils/attendance";
import { useEffect, useState } from "react";

const AttendanceView = () => {
  const [selected, setSelected] = useState(() => nextWeekday(new Date()));
  const [month, setMonth] = useState(() => new Date(selected));
  const { state, retry } = useAttendanceData(month);
  const [authAttempt, setAuthAttempt] = useState<number | null>(null);

  useEffect(() => {
    if (state.status === "unauthorized") {
      setAuthAttempt(state.attempt);
    } else {
      setAuthAttempt(null);
    }
  }, [state]);

  return (
    <AttendanceContext.Provider
      value={{ state, data: state.status === "ready" ? state.data : undefined }}
    >
      {authAttempt !== null && (
        <AuthPopup attempt={authAttempt} onRetry={retry} />
      )}
      <AttendanceCalendar
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

      <SelectedDateBreakdown selectedDate={selected} onRetry={retry} />
    </AttendanceContext.Provider>
  );
};

export default AttendanceView;
