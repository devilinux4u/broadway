import { Download, Share2, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const { settings } = useSiteSettings();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar settings={settings} />
        <main className="pt-16 sm:pt-20 md:pt-24 pb-20 md:pb-0">
          <div className="container mx-auto px-2 sm:px-4 max-w-md text-center py-8 sm:py-12 md:py-16">
            <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
              <Smartphone size={24} className="sm:w-8 sm:h-8 md:w-8 md:h-8 text-primary" />
            </div>
            <h1 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 sm:mb-2.5 md:mb-3">You're all set! 🎉</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">The app is already installed on your device.</p>
          </div>
        </main>
        <Footer settings={settings} />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar settings={settings} />
      <main className="pt-16 sm:pt-20 md:pt-24 pb-20 md:pb-0">
        <div className="container mx-auto px-2 sm:px-4 max-w-md">
          <div className="text-center py-4 sm:py-6 md:py-8">
            <div className="w-16 sm:w-18 md:w-20 h-16 sm:h-18 md:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
              <img src="/pwa-icon-512.png" alt="W7 Nepal" className="w-11 sm:w-12 md:w-14 h-11 sm:h-12 md:h-14 rounded-xl" />
            </div>
            <h1 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1.5 sm:mb-2 md:mb-2">Get the W7 Nepal App</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6 sm:mb-8">Install our app for a faster, smoother shopping experience</p>
          </div>

          {/* Features */}
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3 mb-6 sm:mb-8">
            {[
              { emoji: "⚡", title: "Lightning Fast", desc: "Loads instantly, even on slow connections" },
              { emoji: "📱", title: "App-like Experience", desc: "Full screen, no browser bars" },
              { emoji: "🔔", title: "Order Updates", desc: "Track your orders in real-time" },
              { emoji: "💄", title: "Easy Shopping", desc: "Browse and buy beauty products with ease" },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-2.5 sm:gap-3 md:gap-4 p-2.5 sm:p-3 md:p-4 bg-card border border-border rounded-lg">
                <span className="text-lg sm:text-xl md:text-2xl flex-shrink-0">{f.emoji}</span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Install instructions */}
          {deferredPrompt ? (
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 md:py-4 bg-primary text-primary-foreground font-semibold text-xs sm:text-sm md:text-base tracking-wide rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download size={14} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" /> Install App Now
            </button>
          ) : isIOS ? (
            <div className="bg-secondary rounded-lg p-3 sm:p-4 md:p-5">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 text-center">How to install on iPhone/iPad</h3>
              <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold flex-shrink-0">1</span>
                  <p className="text-xs sm:text-sm md:text-base text-foreground">Tap the <Share2 size={12} className="sm:w-3.5 sm:h-3.5 inline text-primary" /> <strong>Share</strong> button at the bottom of Safari</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold flex-shrink-0">2</span>
                  <p className="text-xs sm:text-sm md:text-base text-foreground">Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                </div>
                <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold flex-shrink-0">3</span>
                  <p className="text-xs sm:text-sm md:text-base text-foreground">Tap <strong>"Add"</strong> to confirm</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-secondary rounded-lg p-3 sm:p-4 md:p-5">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 text-center">How to install</h3>
              <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold flex-shrink-0">1</span>
                  <p className="text-xs sm:text-sm md:text-base text-foreground">Open this page in <strong>Chrome</strong> browser</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold flex-shrink-0">2</span>
                  <p className="text-xs sm:text-sm md:text-base text-foreground">Tap the <strong>⋮ menu</strong> (three dots) at the top right</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold flex-shrink-0">3</span>
                  <p className="text-xs sm:text-sm md:text-base text-foreground">Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></p>
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-4 sm:mt-5 md:mt-6">No app store needed • Free • Takes only seconds</p>
        </div>
      </main>
      <Footer settings={settings} />
      <MobileBottomNav />
    </div>
  );
};

export default Install;
