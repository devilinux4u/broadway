import { getImageUrl } from "@/utils/imageUrl";

interface HeroSectionProps {
  data?: Record<string, any>;
}

const HeroSection = ({ data = {} }: HeroSectionProps) => {
  const hero = data || {};

  const tagline = hero.tagline || "";
  const title = hero.title || "";
  const titleAccent = hero.title_accent || "";
  const description = hero.description || "";
  const ctaText = hero.cta_text || "";
  const cta2Text = hero.cta2_text || "";
  const imageUrl = getImageUrl(hero.image_url);
  const videoUrl = getImageUrl(hero.video_url);

  if (!videoUrl && !imageUrl) {
    return null;
  }

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        {videoUrl ? (
          <video
            src={videoUrl}
            poster={imageUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img src={imageUrl} alt="W7 Cosmetics collection" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      </div>
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-xl">
          <p className="text-sm tracking-[0.3em] uppercase text-rose-light mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {tagline}
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.1] mb-6 text-primary-foreground animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {title}
            <span className="italic block text-rose-light">{titleAccent}</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-md leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {description}
          </p>
          <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <a href="#products" className="inline-flex items-center px-8 py-3.5 bg-primary text-primary-foreground font-medium text-sm tracking-wide rounded-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-lg">
              {ctaText}
            </a>
            <a href="#categories" className="inline-flex items-center px-8 py-3.5 border border-primary-foreground/30 text-primary-foreground font-medium text-sm tracking-wide rounded-sm hover:bg-primary-foreground/10 transition-all duration-300">
              {cta2Text}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
