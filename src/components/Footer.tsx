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

  return (
    <footer className="bg-sky-200 py-10 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4">
            {logoImg && <img src={logoImg} alt={settings.store_name} className="h-28 md:h-36 w-auto mb-4" />}
          </div>

          <div className="md:col-span-4 md:flex md:items-start md:gap-8">
            <div>
              <h4 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-4">Menu</h4>
              <ul className="space-y-2.5">
                {["Contact Us", "Track Order", "Class Update", "Privacy Policy", "Terms of Use"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {location && <li>{location}</li>}
                {phone && <li><a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="hover:text-primary transition-colors">{phone}</a></li>}
                {email && <li><a href={`mailto:${email}`} className="hover:text-primary transition-colors">{email}</a></li>}
              </ul>
            </div>
          </div>

          <div className="md:col-span-4 md:justify-self-center md:px-6">
            <h4 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-4 uppercase tracking-wide">Join Our Community</h4>
            <div className="flex items-start gap-6 md:gap-6">
              {[
                { name: "Facebook", url: facebookUrl, icon: <Facebook size={26} /> },
                { name: "Instagram", url: instagramUrl, icon: <Instagram size={26} /> },
                { name: "Tiktok", url: tiktokUrl, icon: <Music2 size={26} /> },
              ].filter((social) => social.url).map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-current/30">
                    {social.icon}
                  </span>
                  <span className="text-xs md:text-sm">{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {copyright && (
          <div className="mt-1 pt-5 border-t border-border/40 text-center">
            <p className="text-xs text-muted-foreground">{copyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
