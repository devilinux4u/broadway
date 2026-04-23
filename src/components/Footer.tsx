import { getImageUrl } from "@/utils/imageUrl";
import { Facebook, Instagram, Music2 } from "lucide-react";

interface FooterProps {
  settings?: Record<string, any>;
}

const Footer = ({ settings = {} }: FooterProps) => {
  const logoImg = getImageUrl(settings.logo_url);
  const description = settings.footer_description || "";
  const copyright = settings.copyright_text || "";
  const location = settings.location || "";
  const phone = settings.phone || "";
  const email = settings.email || "";
  const instagramUrl = settings.instagram_url || "";
  const facebookUrl = settings.facebook_url || "";
  const tiktokUrl = settings.tiktok_url || "";
  const menuItems = [
    { label: "Track Order", href: "/my-orders" },
    { label: "Class Update", href: "/classes" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Use", href: "#" },
  ];

  return (
    <footer className="bg-sky-200 py-6 sm:py-8 md:py-10 lg:py-12">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">
          <div className="sm:col-span-1 lg:col-span-4">
            {logoImg && <img src={logoImg} alt={settings.store_name} className="h-20 sm:h-28 lg:h-36 w-auto mb-2 sm:mb-4" />}
          </div>

          <div className="sm:col-span-1 lg:col-span-4 flex flex-col sm:flex-row sm:gap-6 lg:gap-8">
            <div className="mb-4 sm:mb-0">
              <h4 className="font-display text-base sm:text-lg lg:text-xl lg:text-2xl font-semibold text-foreground mb-2 sm:mb-3 lg:mb-4">Menu</h4>
              <ul className="space-y-1.5 sm:space-y-2 lg:space-y-2.5">
                {menuItems.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display text-base sm:text-lg lg:text-xl lg:text-2xl font-semibold text-foreground mb-2 sm:mb-3 lg:mb-4">Contact</h4>
              <ul className="space-y-1.5 sm:space-y-2 lg:space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                {location && <li>{location}</li>}
                {phone && <li><a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="hover:text-primary transition-colors">{phone}</a></li>}
                {email && <li><a href={`mailto:${email}`} className="hover:text-primary transition-colors">{email}</a></li>}
              </ul>
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <h4 className="font-display text-base sm:text-lg lg:text-xl lg:text-2xl font-semibold text-foreground mb-2 sm:mb-3 lg:mb-4 uppercase tracking-wide">Join Our Community</h4>
            <div className="flex items-start gap-4 sm:gap-5 lg:gap-6">
              {[
                { name: "Facebook", url: facebookUrl, icon: <Facebook size={24} className="sm:w-6 sm:h-6" /> },
                { name: "Instagram", url: instagramUrl, icon: <Instagram size={24} className="sm:w-6 sm:h-6" /> },
                { name: "Tiktok", url: tiktokUrl, icon: <Music2 size={24} className="sm:w-6 sm:h-6" /> },
              ].filter((social) => social.url).map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md border border-current/30">
                    {social.icon}
                  </span>
                  <span className="text-[10px] sm:text-xs lg:text-sm">{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {copyright && (
          <div className="mt-4 sm:mt-6 lg:mt-1 pt-3 sm:pt-4 lg:pt-5 border-t border-border/40 text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground">{copyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
