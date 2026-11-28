import type { CalendarData, LoadState } from "@hooks/useAttendanceData";
import { createContext } from "react";

const AttendanceContext = createContext<{
  state: LoadState;
  data?: CalendarData;
}>({
  state: { status: "loading" },
});

export default AttendanceContext;
