import { Truck, Shield, Star, MapPin, Leaf, Award, Heart, Package, Sparkles, Globe } from "lucide-react";

interface AboutBannerProps {
  data?: Record<string, any>;
}

const iconMap: Record<string, any> = { Truck, Shield, Star, MapPin, Leaf, Award, Heart, Package, Sparkles, Globe };

const AboutBanner = ({ data = {} }: AboutBannerProps) => {
  const about = data || {};

  const tagline = about.tagline || "";
  const title = about.title || "";
  const description = about.description || "";
  const features = Array.isArray(about.features) ? about.features : [];

  if (!title && features.length === 0) {
    return null;
  }

  return (
    <section id="about" className="py-12 md:py-16 bg-rose-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-3">{tagline}</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">{description}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f: any, i: number) => {
            const Icon = iconMap[f.icon];
            if (!Icon) return null;

            return (
              <div key={f.title + i} className="text-center p-6 rounded-sm bg-card/60 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                {f.link && (
                  <a href={f.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs font-medium text-primary hover:text-primary/80 underline underline-offset-2">
                    Verify on PETA →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutBanner;
