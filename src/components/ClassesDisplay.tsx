import { useState } from "react";
import ClassCard from "./ClassCard";
import { parseISO, isAfter, isBefore, isEqual } from "date-fns";

interface ClassItem {
  title: string;
  start_date: string;
  end_date: string;
}

interface ClassesDisplayProps {
  classes: ClassItem[];
}

const ClassesDisplay = ({ classes }: ClassesDisplayProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    ongoing: true,
    upcoming: true,
    ended: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const categorizeClasses = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const ongoing: ClassItem[] = [];
    const upcoming: ClassItem[] = [];
    const ended: ClassItem[] = [];

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
          // Ended: end date is in the past
          ended.push(cls);
        } else {
          // Ongoing: start date is today or past, end date is today or future
          ongoing.push(cls);
        }
      } catch (error) {
        console.error("Error parsing class dates:", error);
      }
    });

    return { ongoing, upcoming, ended };
  };

  const { ongoing, upcoming, ended } = categorizeClasses();

  const sectionConfig = [
    {
      id: "ongoing",
      title: "🎓 Ongoing Classes",
      classes: ongoing,
      color: "from-emerald-500 to-teal-500",
      status: "ongoing" as const,
      subtitle: "Classes currently in progress",
    },
    {
      id: "upcoming",
      title: "📅 Upcoming Classes",
      classes: upcoming,
      color: "from-blue-500 to-indigo-500",
      status: "upcoming" as const,
      subtitle: "Classes starting soon",
    },
    {
      id: "ended",
      title: "✓ Past Classes",
      classes: ended,
      color: "from-gray-500 to-slate-500",
      status: "ended" as const,
      subtitle: "Classes that have ended",
    },
  ];

  return (
    <div className="space-y-8">
      {sectionConfig.map((section) => (
        <div key={section.id} className="space-y-4">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full group"
          >
            <div
              className={`bg-gradient-to-r ${section.color} rounded-xl px-6 py-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                  <p className="text-white/80 text-sm mt-1">{section.subtitle}</p>
                </div>
                <div className="text-3xl opacity-70 group-hover:opacity-100 transition-opacity">
                  {expandedSections[section.id] ? "▼" : "▶"}
                </div>
              </div>
            </div>
          </button>

          {expandedSections[section.id] && (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in`}
            >
              {section.classes.length > 0 ? (
                section.classes.map((cls, idx) => (
                  <ClassCard
                    key={idx}
                    title={cls.title}
                    startDate={cls.start_date}
                    endDate={cls.end_date}
                    status={section.status}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-foreground/50 text-lg">No {section.id} classes at the moment</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ClassesDisplay;
