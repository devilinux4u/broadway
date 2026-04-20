import { Calendar, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

interface ClassCardProps {
  title: string;
  startDate: string;
  endDate: string;
  status: "ongoing" | "upcoming" | "ended";
}

const ClassCard = ({ title, startDate, endDate, status }: ClassCardProps) => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  const statusColors = {
    ongoing: {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      border: "border-emerald-300",
      badge: "bg-emerald-500 text-white",
    },
    upcoming: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      border: "border-blue-300",
      badge: "bg-blue-500 text-white",
    },
    ended: {
      bg: "bg-gradient-to-br from-gray-50 to-slate-50",
      border: "border-gray-300",
      badge: "bg-gray-500 text-white",
    },
  };

  const colors = statusColors[status];
  const displayStart = format(start, "MMM dd, yyyy");
  const displayEnd = format(end, "MMM dd, yyyy");

  return (
    <div
      className={`${colors.bg} border-2 ${colors.border} rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground pr-4 flex-1">{title}</h3>
        <span className={`${colors.badge} text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap`}>
          {status === "ongoing" ? "Ongoing" : status === "upcoming" ? "Upcoming" : "Ended"}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3 text-foreground/70">
          <Calendar size={16} className="flex-shrink-0" />
          <span>Start: <span className="font-medium text-foreground">{displayStart}</span></span>
        </div>
        <div className="flex items-center gap-3 text-foreground/70">
          <Clock size={16} className="flex-shrink-0" />
          <span>End: <span className="font-medium text-foreground">{displayEnd}</span></span>
        </div>
      </div>

      {status === "ongoing" && (
        <div className="mt-4 pt-4 border-t border-emerald-200">
          <p className="text-emerald-700 font-medium text-sm">🎯 This class is currently active</p>
        </div>
      )}
    </div>
  );
};

export default ClassCard;
