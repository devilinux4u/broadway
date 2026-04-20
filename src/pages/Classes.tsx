import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useClasses } from "@/hooks/useClasses";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { type ClassItem } from "@/services/classesAPI";
import { parseISO, startOfMonth, addMonths, format, isSameDay, getDaysInMonth, getDay, isAfter, isBefore } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Classes = () => {
  const { getSection, loading } = useSiteContent();
  const { classes, loading: classesLoading } = useClasses();
  const [monthStart, setMonthStart] = useState<Date>(startOfMonth(new Date()));

  const settingsData = getSection("settings");

  // Get classes for a specific date
  const getClassesForDate = (date: Date): ClassItem[] => {
    return classes.filter((cls) => {
      const classDate = parseISO(cls.start_date);
      return isSameDay(classDate, date);
    });
  };

  // Get ongoing and upcoming classes
  const getOngoingAndUpcomingClasses = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const ongoing: ClassItem[] = [];
    const upcoming: ClassItem[] = [];

    classes.forEach((cls) => {
      try {
        const startDate = parseISO(cls.start_date);
        const endDate = parseISO(cls.end_date);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (isAfter(startDate, now)) {
          // Upcoming: start date is in the future
          upcoming.push(cls);
        } else if (isBefore(endDate, now)) {
          // Ended: skip
        } else {
          // Ongoing: start date is today or past, end date is today or future
          ongoing.push(cls);
        }
      } catch (error) {
        console.error("Error parsing class dates:", error);
      }
    });

    return { ongoing, upcoming };
  };

  // Get calendar grid for the month
  const getMonthCalendar = () => {
    const daysInMonth = getDaysInMonth(monthStart);
    const startDayOfWeek = getDay(monthStart);
    const days: (number | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const nextMonth = () => {
    setMonthStart(addMonths(monthStart, 1));
  };

  const prevMonth = () => {
    setMonthStart(addMonths(monthStart, -1));
  };

  const getColorForClass = (index: number): string => {
    const colors = [
      "bg-blue-100 border-blue-400 text-blue-900",
      "bg-purple-100 border-purple-400 text-purple-900",
      "bg-emerald-100 border-emerald-400 text-emerald-900",
      "bg-orange-100 border-orange-400 text-orange-900",
      "bg-pink-100 border-pink-400 text-pink-900",
      "bg-indigo-100 border-indigo-400 text-indigo-900",
    ];
    return colors[index % colors.length];
  };

  const getClassStatus = (cls: ClassItem): "ended" | "ongoing" | "upcoming" => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const startDate = parseISO(cls.start_date);
    const endDate = parseISO(cls.end_date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (isBefore(endDate, now)) return "ended";
    if (isAfter(startDate, now)) return "upcoming";
    return "ongoing";
  };

  const getCalendarThemeByStatus = (cls: ClassItem): string => {
    const status = getClassStatus(cls);

    if (status === "ended") return "bg-slate-400 border border-slate-400 text-slate-900";
    if (status === "ongoing") return "bg-orange-100 border border-orange-400 text-orange-900";

    return "bg-blue-100 border border-blue-400 text-blue-900";
  };

  const getCalendarDayStatus = (dayClasses: ClassItem[]): "ended" | "ongoing" | "upcoming" | null => {
    if (dayClasses.length === 0) return null;

    if (dayClasses.some((cls) => getClassStatus(cls) === "ongoing")) return "ongoing";
    if (dayClasses.some((cls) => getClassStatus(cls) === "upcoming")) return "upcoming";
    if (dayClasses.some((cls) => getClassStatus(cls) === "ended")) return "ended";

    return null;
  };

  const getCalendarDayBgByStatus = (status: "ended" | "ongoing" | "upcoming" | null): string => {
    if (status === "ended") return "bg-slate-100";
    if (status === "ongoing") return "bg-orange-50";
    if (status === "upcoming") return "bg-blue-50";
    return "";
  };

  const { ongoing, upcoming } = getOngoingAndUpcomingClasses();
  const visibleClasses = [
    ...ongoing.map((cls) => ({ ...cls, status: "Ongoing" as const, statusClass: "bg-accent" })),
    ...upcoming.map((cls) => ({ ...cls, status: "Coming Soon" as const, statusClass: "bg-primary" })),
  ];

  if (loading || classesLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-foreground/60">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar settings={settingsData} />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          
          <p className="text-foreground/70">View our classes and their schedules</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[28rem_minmax(0,1fr)] gap-8">
          {/* Ongoing and Upcoming Classes */}
          <div>
            <div className="bg-card border border-border rounded-lg p-4 shadow-md sticky top-28 space-y-6">
              {visibleClasses.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-base font-semibold text-foreground">Classes</h3>
                    <span className="bg-primary text-white text-xs font-semibold px-2 py-1 rounded whitespace-nowrap h-fit">
                      {visibleClasses.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {visibleClasses.map((cls, idx) => {
                      const startDate = parseISO(cls.start_date);
                      const endDate = parseISO(cls.end_date);
                      return (
                        <div
                          key={`${cls.title}-${cls.start_date}-${idx}`}
                          className="p-3 md:p-4 rounded-sm border-2 bg-primary/10 border-primary/30 hover:border-primary/50 hover:shadow-md transition-all flex gap-3 items-center justify-between"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1 line-clamp-2 text-foreground">{cls.title}</h4>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span className="font-medium">{format(startDate, "MMM dd")}</span>
                              <span>→</span>
                              <span className="font-medium">{format(endDate, "MMM dd")}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                              {cls.start_time} - {cls.end_time}
                            </p>
                          </div>
                          <span className={`${cls.statusClass} text-white text-xs font-semibold px-2 py-1 rounded whitespace-nowrap h-fit`}>
                            {cls.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {visibleClasses.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-6">
                  <p className="text-sm text-muted-foreground font-medium">No classes scheduled</p>
                  <p className="text-xs text-muted-foreground/60">Check back soon for upcoming classes</p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Calendar */}
          <div className="space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4 shadow-md w-full max-w-[860px] ml-auto">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-secondary rounded-md transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold text-foreground">
                {format(monthStart, "MMMM yyyy")}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-secondary rounded-md transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-card border border-border rounded-lg shadow-md overflow-hidden w-full max-w-[860px] ml-auto">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b border-border bg-secondary sticky top-0 z-10">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center text-xs font-semibold text-foreground border-r border-border last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7">
                {getMonthCalendar().map((day, idx) => {
                  const isToday = day !== null && isSameDay(new Date(monthStart.getFullYear(), monthStart.getMonth(), day), new Date());
                  const cellDate = day !== null ? new Date(monthStart.getFullYear(), monthStart.getMonth(), day) : null;
                  const cellClasses = cellDate ? getClassesForDate(cellDate) : [];
                  const dayStatus = getCalendarDayStatus(cellClasses);
                  const dayBgByStatus = getCalendarDayBgByStatus(dayStatus);
                  
                  return (
                    <div
                      key={idx}
                      className={`min-h-24 border border-border p-1 cursor-pointer transition-colors ${
                        day === null ? "bg-background/30" : ""
                      } ${
                        day !== null ? dayBgByStatus : ""
                      } ${
                        isToday ? "ring-1 ring-primary/60" : "hover:bg-secondary/30"
                      }`}
                    >
                      {day !== null && (
                        <>
                          <p className={`text-xl font-semibold mb-1 ${isToday ? "text-primary" : "text-foreground"}`}>
                            {day}
                          </p>
                          <div className="space-y-1">
                            {cellClasses.length > 0 ? (
                              <>
                                {cellClasses.slice(0, 2).map((cls, classIdx) => (
                                  <div
                                    key={classIdx}
                                    className={`text-xs p-1 rounded truncate font-medium ${getCalendarThemeByStatus(cls)}`}
                                  >
                                    <p className="truncate">{cls.title}</p>
                                    <p className="text-[10px] opacity-80">
                                      {format(parseISO(cls.start_date), "MMM dd")} - {format(parseISO(cls.end_date), "MMM dd")}
                                    </p>
                                  </div>
                                ))}
                                {cellClasses.length > 2 && (
                                  <div className="text-xs p-1 font-medium text-foreground/60">
                                    +{cellClasses.length - 2} more
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-xs text-foreground/30">-</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* No classes message */}
            {classes.length === 0 && (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <p className="text-foreground/60">No classes scheduled yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer settings={settingsData} />
      <MobileBottomNav />
    </div>
  );
};

export default Classes;

