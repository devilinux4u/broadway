import { useRef, useState } from "react";
import { getImageUrl } from "@/utils/imageUrl";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CategorySectionProps {
  data?: Record<string, any>;
}

const CategorySection = ({ data = {} }: CategorySectionProps) => {
  const navigate = useNavigate();
  const catContent = data || {};
  const categories = Array.isArray(catContent.items) ? catContent.items : [];
  const featuredCategories = categories;
  const { getSection } = useSiteContent();
  const classesData = getSection("classes") || {};
  const classItems = Array.isArray(classesData.items) ? classesData.items : [];
  const upcomingClasses = classItems.slice(0, 3);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);

  const getShopCategoryKey = (cat: any) => {
    const raw = String(cat?.category || cat?.slug || cat?.name || "").trim().toLowerCase();
    if (!raw) return "";
    if (raw.includes("face")) return "face";
    if (raw.includes("eye")) return "eyes";
    if (raw.includes("lip")) return "lips";
    if (raw.includes("nail")) return "nails";
    if (raw.includes("tool") || raw.includes("accessor")) return "tools";
    return raw;
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const maxPosition = clientWidth - cardWidth;
      const position = maxScroll > 0 ? (scrollLeft / maxScroll) * maxPosition : 0;
      setSliderPosition(Math.max(0, position));
    }
  };

  const updateCardWidth = () => {
    if (scrollContainerRef.current) {
      const firstChild = scrollContainerRef.current.firstChild as HTMLElement;
      if (firstChild) {
        setCardWidth(firstChild.offsetWidth);
      }
    }
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <section id="categories" className="py-12 md:py-16 bg-warm-cream overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-primary mb-2 sm:mb-3">Browse</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">Shop by Category</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.6fr] min-h-[220px] md:min-h-[280px] rounded-sm gap-4 lg:gap-10">
          <div className="flex flex-col">
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              onLoad={updateCardWidth}
              onMouseEnter={updateCardWidth}
              className="flex items-center justify-center overflow-x-auto hide-scrollbar"
            >
              <div className="flex gap-6 pl-4 pr-4 py-8 w-max snap-x snap-mandatory">
              {featuredCategories.map((cat: any, i: number) => {
                const catImageUrl = getImageUrl(cat.image_url);
                const categoryKey = getShopCategoryKey(cat);
                const categoryHref = categoryKey ? `/shop?category=${encodeURIComponent(categoryKey)}` : "/shop";

                return (
                  <a
                    key={`promo-${cat.name}-${i}`}
                    href={categoryHref}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(categoryHref);
                    }}
                    className="group relative w-44 md:w-56 h-44 md:h-56 shrink-0 snap-center rounded-sm overflow-hidden"
                  >
                    {catImageUrl ? (
                      <img src={catImageUrl} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-white/40" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                      <h3 className="font-display text-lg md:text-xl font-semibold text-primary-foreground mb-1 leading-tight">{cat.name}</h3>
                      <p className="text-xs text-primary-foreground/70 mb-2 line-clamp-2">{cat.description}</p>
                      <span className="inline-flex items-center text-xs font-medium text-primary-foreground tracking-wide border-b border-primary-foreground/40 pb-0.5 group-hover:border-primary-foreground transition-colors">Shop Now →</span>
                    </div>
                  </a>
                );
              })}
              </div>
            </div>
            {categories.length > 4 && (
              <div className="h-1 bg-foreground/10 rounded-full overflow-visible mt-2">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ 
                    width: `${cardWidth}px`,
                    transform: `translateX(${sliderPosition}px)`
                  }}
                />
              </div>
            )}
          </div>

          <div className="relative min-h-[220px] md:min-h-[280px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-sm overflow-hidden flex flex-col items-center justify-center p-6">
            {upcomingClasses.length > 0 ? (
              <div className="w-full h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-primary" />
                    <h3 className="font-display text-lg md:text-xl font-semibold text-foreground">Upcoming Classes</h3>
                  </div>
                  <button
                    onClick={() => navigate("/classes")}
                    className="ml-auto inline-flex items-center justify-center rounded-sm border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap"
                  >
                    Learn More
                  </button>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {upcomingClasses.map((cls: any, idx: number) => {
                    const startDate = new Date(cls.start_date);
                    const endDate = new Date(cls.end_date);
                    const isStarted = startDate <= new Date();
                    const isEnded = endDate < new Date();
                    
                    let statusText = "Coming Soon";
                    let statusBgColor = "bg-primary";
                    
                    if (isEnded) {
                      statusText = "Ended";
                      statusBgColor = "bg-muted-foreground";
                    } else if (isStarted && !isEnded) {
                      statusText = "Ongoing";
                      statusBgColor = "bg-accent";
                    }
                    
                    return (
                      <div
                        key={idx}
                        className="p-3 md:p-4 rounded-sm border-2 bg-primary/10 border-primary/30 hover:border-primary/50 hover:shadow-md transition-all flex gap-3 items-center justify-between"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1 line-clamp-2 text-foreground">
                            {cls.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="font-medium">
                              {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                            <span>→</span>
                            <span className="font-medium">
                              {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        </div>
                        <span className={`${statusBgColor} text-white text-xs font-semibold px-2 py-1 rounded whitespace-nowrap h-fit`}>
                          {statusText}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center pt-3 border-t border-border/30">
                  <p className="text-xs text-muted-foreground">More classes coming soon!</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                <Calendar size={32} className="text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground font-medium">No classes scheduled</p>
                <p className="text-xs text-muted-foreground/60">Check back soon for upcoming classes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
