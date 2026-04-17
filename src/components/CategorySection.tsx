import { getImageUrl } from "@/utils/imageUrl";
import categoryPromoImage from "@/assets/category.png";

interface CategorySectionProps {
  data?: Record<string, any>;
}

const CategorySection = ({ data = {} }: CategorySectionProps) => {
  const catContent = data || {};
  const categories = Array.isArray(catContent.items) ? catContent.items : [];
  const featuredCategories = categories;

  if (categories.length === 0) {
    return null;
  }

  return (
    <section id="categories" className="py-12 md:py-16 bg-warm-cream overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 md:mb-8">
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-3">Browse</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">Shop by Category</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.6fr] min-h-[220px] md:min-h-[280px] rounded-sm gap-4 lg:gap-10">
          <div className="flex items-center overflow-x-auto hide-scrollbar">
            <div className="flex gap-6 pl-4 pr-4 py-8 w-max snap-x snap-mandatory">
              {featuredCategories.map((cat: any, i: number) => {
                const catImageUrl = getImageUrl(cat.image_url);

                return (
                  <a
                    key={`promo-${cat.name}-${i}`}
                    href="#"
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

          <div className="relative min-h-[220px] md:min-h-[280px] bg-muted">
            <img src={categoryPromoImage} alt="Category Promo" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
