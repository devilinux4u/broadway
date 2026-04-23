import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { getImageUrl } from "@/utils/imageUrl";

interface ReelItem {
  title?: string;
  video_url?: string;
}

interface ReelsSectionProps {
  data?: Record<string, any>;
}

const ReelsSection = ({ data = {} }: ReelsSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const reels = useMemo(() => {
    if (!Array.isArray(data.reels)) return [];
    return (data.reels as ReelItem[])
      .map((reel) => ({
        title: reel.title || "",
        video_url: getImageUrl(reel.video_url),
      }))
      .filter((reel) => !!reel.video_url);
  }, [data.reels]);

  const loopedReels = useMemo(() => {
    if (reels.length === 0) return [] as ReelItem[];
    return Array.from({ length: 7 }, () => reels).flat();
  }, [reels]);

  useEffect(() => {
    if (reels.length === 0) return;
    setActiveCardIndex(reels.length * 3 + Math.floor(reels.length / 2));
  }, [reels.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || loopedReels.length === 0) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-reel-card]"));
    const middleIndex = reels.length * 3 + Math.floor(reels.length / 2);
    const targetCard = cards[middleIndex];
    if (!targetCard) return;

    const targetLeft = targetCard.offsetLeft + targetCard.offsetWidth / 2 - container.clientWidth / 2;
    const maxScrollLeft = Math.max(container.scrollWidth - container.clientWidth, 0);
    container.scrollLeft = Math.min(Math.max(targetLeft, 0), maxScrollLeft);
  }, [reels.length, loopedReels.length]);

  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      video.muted = isMuted;
      if (idx === activeCardIndex) {
        video.currentTime = 0;
        video.play().catch(() => undefined);
        setIsPlaying(true);
      } else {
        video.pause();
      }
    });
  }, [activeCardIndex, isMuted]);

  const handleTogglePlay = () => {
    const activeVideo = videoRefs.current[activeCardIndex];
    if (!activeVideo) return;

    if (activeVideo.paused) {
      activeVideo.play().then(() => setIsPlaying(true)).catch(() => undefined);
      return;
    }

    activeVideo.pause();
    setIsPlaying(false);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    const activeVideo = videoRefs.current[activeCardIndex];
    if (activeVideo) {
      activeVideo.muted = nextMuted;
    }
  };

  const handleSelectReel = (index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-reel-card]"));
    setActiveCardIndex(index);
    cards[index]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  if (reels.length === 0) {
    return null;
  }

  return (
    <section id="reels" className="py-12 md:py-16 bg-[#e8e8e8]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-primary mb-2 sm:mb-3">Watch & Shop</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">Reels</h2>
        </div>

        <div className="overflow-x-auto md:overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory touch-pan-x" ref={containerRef}>
          <div className="w-max min-w-full flex items-center justify-start md:justify-center gap-2 md:gap-3 px-1 md:px-2">
          {loopedReels.map((reel, i) => (
            <article
              key={`${reel.title || "reel"}-${i}-${Math.floor(i / Math.max(reels.length, 1))}`}
              data-reel-card
              onClick={() => handleSelectReel(i)}
              className="w-[240px] md:w-[280px] lg:w-[310px] shrink-0 snap-center cursor-pointer"
            >
              <div className="relative h-[450px] md:h-[500px] w-full flex items-center justify-center">
                <div
                  className={`relative w-full overflow-hidden rounded-md bg-muted transition-[height] duration-300 ease-out ${
                    activeCardIndex === i ? "h-[450px] md:h-[500px]" : "h-[390px] md:h-[440px]"
                  }`}
                >
                  <video
                    ref={(el) => (videoRefs.current[i] = el)}
                    src={reel.video_url || undefined}
                    muted
                    loop
                    playsInline
                    controls={false}
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />

                  {activeCardIndex === i && (
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePlay();
                        }}
                        className="h-9 w-9 rounded-full bg-black/55 text-white backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                        aria-label={isPlaying ? "Pause reel" : "Play reel"}
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMute();
                        }}
                        className="h-9 w-9 rounded-full bg-black/55 text-white backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                        aria-label={isMuted ? "Unmute reel" : "Mute reel"}
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReelsSection;
