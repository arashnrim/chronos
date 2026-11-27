import { Calendar, CalendarDayButton } from "@root/src/components/ui/Calendar";
import {
  capacityLevelColors,
  getAttendance,
  getCapacityLevel,
} from "@utils/attendance";
import { createContext, useContext } from "react";
import type { DayButton } from "react-day-picker";
import type { CalendarData } from "../hooks/useAttendanceData";

const AttendanceContext = createContext<{
  data: CalendarData | null;
  isLoading: boolean;
}>({ data: null, isLoading: false });

const AttendanceDayButton = (props: React.ComponentProps<typeof DayButton>) => {
  const { data, isLoading } = useContext(AttendanceContext);
  const attendance =
    data && getAttendance(props.day.date, data.people, data.events);
  const level =
    attendance &&
    data &&
    getCapacityLevel(attendance.peopleIn.length, data.people.length);
  const label = props["aria-label"];

  return (
    <CalendarDayButton
      {...props}
      className="mx-auto w-full max-w-12 sm:max-w-18"
      aria-label={
        level && data && attendance
          ? `${label}, ${attendance.peopleIn.length} of ${data.people.length} people in`
          : label
      }
    >
      <span className="!text-xl font-semibold !opacity-100">
        {props.children}
      </span>
      {level && attendance && (
        <span
          aria-hidden="true"
          className={`!text-xs font-light leading-none !opacity-100 ${
            props.modifiers.selected
              ? "text-primary-muted"
              : capacityLevelColors[level]
          }`}
        >
          {attendance.peopleIn.length}
        </span>
      )}
      {!level && isLoading && (
        <span
          aria-hidden="true"
          className="h-2 w-4 animate-pulse rounded-sm bg-muted"
        />
      )}
    </CalendarDayButton>
  );
};

export const AttendanceCalendar = ({
  data,
  isLoading,
  selected,
  month,
  onSelect,
  onMonthChange,
}: {
  data: CalendarData | null;
  isLoading: boolean;
  selected: Date;
  month: Date;
  onSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}) => {
  return (
    <AttendanceContext.Provider value={{ data, isLoading }}>
      <Calendar
        mode="single"
        required
        selected={selected}
        onSelect={onSelect}
        month={month}
        onMonthChange={onMonthChange}
        startMonth={new Date()}
        fixedWeeks
        showOutsideDays={false}
        weekStartsOn={1}
        hidden={{ dayOfWeek: [0, 6] }}
        modifiers={{ weekend: { dayOfWeek: [0, 6] } }}
        modifiersClassNames={{ weekend: "hidden" }}
        components={{ DayButton: AttendanceDayButton }}
        className="max-h-[640px] rounded-lg border p-4 sm:p-6"
        classNames={{
          root: "w-full",
          months: "relative flex w-full flex-col",
          weekdays: "flex [&>th:nth-last-child(-n+2)]:hidden",
          week: "mt-2 flex h-12 w-full sm:h-18 [&:not(:has(td:not([data-hidden=true])))]:hidden",
          day: "group/day relative h-full w-full p-0 text-center select-none",
          today: "bg-none",
        }}
      />
      <div
        className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"
        aria-label="Capacity legend"
      >
        <span>Capacity is</span>
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="size-2 rounded-full bg-red-600" />
          below 50%
        </span>
        <span className="flex items-center gap-1">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-orange-500"
          />
          between 50 and 75%
        </span>
        <span className="flex items-center gap-1">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-green-600"
          />
          more than 75%
        </span>
      </div>
    </AttendanceContext.Provider>
  );
};
