import { useRef } from "react";
import { Download, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MembershipCardProps {
  email: string;
  points: number;
  totalEarned: number;
  memberId: string;
}

const getTier = (totalEarned: number) => {
  if (totalEarned >= 1000) return { name: "Gold", color: "from-[hsl(38,60%,45%)] to-[hsl(38,70%,60%)]", badge: "✦" };
  if (totalEarned >= 500) return { name: "Silver", color: "from-[hsl(220,10%,55%)] to-[hsl(220,15%,75%)]", badge: "◆" };
  return { name: "Bronze", color: "from-[hsl(20,40%,45%)] to-[hsl(20,50%,60%)]", badge: "●" };
};

const MembershipCard = ({ email, points, totalEarned, memberId }: MembershipCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const tier = getTier(totalEarned);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    // Dynamic import for html2canvas
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      backgroundColor: null,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = "membership-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="mb-10">
      {/* The card */}
      <div
        ref={cardRef}
        className={`relative w-full max-w-md mx-auto aspect-[1.6/1] rounded-2xl bg-gradient-to-br ${tier.color} p-6 flex flex-col justify-between overflow-hidden shadow-xl`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-white/5" />

        {/* Top row */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-white/80 text-[10px] uppercase tracking-[3px] font-medium">Membership Card</p>
            <h3 className="text-white text-lg font-bold mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Eves Beauty
            </h3>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <Crown className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-semibold">{tier.name}</span>
          </div>
        </div>

        {/* Middle - Points */}
        <div className="relative z-10 flex items-center gap-3">
          <Star className="w-8 h-8 text-white/90" fill="currentColor" />
          <div>
            <p className="text-white text-3xl font-bold leading-none">{points.toLocaleString()}</p>
            <p className="text-white/70 text-[11px] mt-0.5">Available Points</p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-white/60 text-[9px] uppercase tracking-[2px]">Member</p>
            <p className="text-white text-sm font-medium truncate max-w-[200px]">{email}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-[9px] uppercase tracking-[2px]">ID</p>
            <p className="text-white text-xs font-mono">{memberId.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="flex justify-center mt-4">
        <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> Download Card
        </Button>
      </div>
    </div>
  );
};

export default MembershipCard;
