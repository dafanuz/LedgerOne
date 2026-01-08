import useMobile from "@/hooks/useMobile";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  formatISO,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CalendarRangeIcon } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

type DatePickerProps = {
  value: string | null;
  onChange: (date: string | null) => void;
  placeholder?: string;
};

export const DatePicker = memo(
  ({ value, onChange, placeholder = "Select date" }: DatePickerProps) => {
    const isMobile = useMobile();
    const [isOpen, setIsOpen] = useState(false);

    const selectedDate = value ? parseISO(value) : null;
    const [currentMonth, setCurrentMonth] = useState<Date>(
      selectedDate ?? new Date()
    );
    const [focusedDate, setFocusedDate] = useState<Date>(
      selectedDate ?? new Date()
    );

    const containerRef = useRef<HTMLDivElement>(null);

    /* Close on outside click */
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* Keyboard navigation */
    useEffect(() => {
      if (!isOpen) return;

      const onKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case "Escape":
            setIsOpen(false);
            break;
          case "ArrowRight":
            setFocusedDate((d) => addDays(d, 1));
            break;
          case "ArrowLeft":
            setFocusedDate((d) => addDays(d, -1));
            break;
          case "ArrowDown":
            setFocusedDate((d) => addDays(d, 7));
            break;
          case "ArrowUp":
            setFocusedDate((d) => addDays(d, -7));
            break;
          case "Enter":
            onChange(formatISO(focusedDate));
            setIsOpen(false);
            break;
        }
      };

      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, focusedDate, onChange]);

    const days = eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentMonth)),
      end: endOfWeek(endOfMonth(currentMonth)),
    });

    const selectDate = (date: Date) => {
      onChange(formatISO(date));
      setIsOpen(false);
    };

    return (
      <div ref={containerRef} className="relative w-full">
        {/* Input */}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
          className={`${selectedDate ? "text-slate-600" : "text-slate-400"} w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 text-[13px] outline-none flex items-center justify-between shadow-sm`}
        >
          <span>
            {selectedDate ? format(selectedDate, "dd/MM/yyyy") : placeholder}
          </span>
          <CalendarRangeIcon className="text-slate-400" size={18}/>
        </button>

        {isOpen && (
          <>
            {/* Blurred overlay */}
            {isMobile && (
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-fade-in"
                onClick={() => setIsOpen(false)}
              />
            )}

            {/* Picker wrapper */}
            <div
              className={`
                z-50
                ${
                  isMobile
                    ? "fixed inset-0 flex items-center justify-center px-4"
                    : "absolute mt-2"
                }
              `}
            >
              {/* Picker */}
              <div
                role="dialog"
                aria-modal="true"
                className="
                  w-full max-w-[90vw] sm:w-80
                  bg-white dark:bg-slate-900 rounded-xl shadow-xl border
                  animate-scale-in
                "
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <button
                    onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                  >
                    ‹
                  </button>
                  <h2 className="font-semibold">
                    {format(currentMonth, "MMMM yyyy")}
                  </h2>
                  <button
                    onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                  >
                    ›
                  </button>
                </div>

                {/* Calendar */}
                <div className="grid grid-cols-7 gap-1 p-3 max-h-[60vh] overflow-y-auto">
                  {days.map((day) => {
                    const selected =
                      selectedDate && isSameDay(day, selectedDate);
                    const focused = isSameDay(day, focusedDate);

                    return (
                      <button
                        key={day.toISOString()}
                        role="gridcell"
                        aria-selected={selected}
                        onClick={() => selectDate(day)}
                        onFocus={() => setFocusedDate(day)}
                        className={`
                          p-2 rounded-lg text-sm
                          ${
                            !isSameMonth(day, currentMonth)
                              ? "text-gray-300"
                              : ""
                          }
                          ${
                            selected
                              ? "bg-blue-500 text-white"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }
                          ${focused && !selected ? "ring-2 ring-blue-400" : ""}
                          ${
                            isToday(day) && !selected
                              ? "border border-blue-400"
                              : ""
                          }
                        `}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex justify-between p-4 border-t">
                  <button
                    onClick={() => {
                      onChange(null);
                      setIsOpen(false);
                    }}
                  >
                    Clear
                  </button>
                  <button onClick={() => selectDate(new Date())}>Today</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
