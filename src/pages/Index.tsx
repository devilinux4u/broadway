import { useMainPageContent } from "@/hooks/useMainPageContent";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import NewArrivals from "@/components/NewArrivals";
import FeaturedProducts from "@/components/FeaturedProducts";
import ReelsSection from "@/components/ReelsSection";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

const Index = () => {
  const { content, featuredProducts, newArrivals, loading, error, getSection } = useMainPageContent();

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center px-2 sm:px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 border-b-2 border-primary"></div>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-foreground/60">Loading page content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading page content:", error);
  }

  const heroData = getSection("hero");
  const categoriesData = getSection("categories");
  const aboutData = getSection("about");
  const newsletterData = getSection("newsletter");
  const settingsData = getSection("settings");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar settings={settingsData} />
      <main>
        <HeroSection data={heroData} />
        <NewArrivals products={newArrivals} />
        <FeaturedProducts products={featuredProducts} />
        <CategorySection data={categoriesData} />
        <ReelsSection data={aboutData} />
        <Newsletter data={newsletterData} />
      </main>
      <Footer settings={settingsData} />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
