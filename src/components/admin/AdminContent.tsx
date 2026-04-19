import { useState, useEffect } from "react";
import { adminContentAPI } from "@/services/adminAPI";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, Trash2, Plus } from "lucide-react";
import { getImageUrl } from "@/utils/imageUrl";

interface Content {
  section: string;
  content: any;
  updated_at?: string;
}

const AdminContent = () => {
  const { toast } = useToast();
  const [contentData, setContentData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Section states
  const [hero, setHero] = useState<any>({});
  const [categories, setCategories] = useState<any>({ items: [] });
  const [about, setAbout] = useState<any>({ reels: [] });
  const [newsletter, setNewsletter] = useState<any>({});
  const [classes, setClasses] = useState<any>({ items: [] });
  const [settings, setSettings] = useState<any>({});
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    // Initialize section states from contentData
    if (contentData.hero) setHero(contentData.hero);
    if (contentData.categories) setCategories(contentData.categories);
    if (contentData.about) setAbout(contentData.about);
    if (contentData.newsletter) setNewsletter(contentData.newsletter);
    if (contentData.classes) setClasses(contentData.classes);
    if (contentData.settings) setSettings(contentData.settings);
  }, [contentData]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await adminContentAPI.getAllContent();
      console.log("Response from getAllContent:", response);
      if (response.sections && Array.isArray(response.sections)) {
        const content: Record<string, any> = {};
        response.sections.forEach((item: any) => {
          // Content is already processed by the API, don't re-parse
          content[item.section] = item.content || {};
        });
        console.log("Processed content data:", content);
        setContentData(content);
      }
    } catch (error) {
      console.error("Failed to load content:", error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSection = async (section: string, content: any) => {
    try {
      setSaving(section);
      await adminContentAPI.updateContent(section, content);
      toast({
        title: `${section.charAt(0).toUpperCase() + section.slice(1)} section saved!`,
      });
    } catch (error) {
      console.error("Failed to save section:", error);
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await adminContentAPI.getProducts();
      console.log("Products response:", response);
      if (response.products) {
        console.log("Setting products:", response.products);
        setProducts(response.products);
      } else if (response.data) {
        console.log("Setting products from response.data:", response.data);
        setProducts(response.data);
      } else if (Array.isArray(response)) {
        console.log("Response is array, setting directly:", response);
        setProducts(response);
      } else {
        console.log("Unexpected response format:", response);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setProductsLoading(false);
    }
  };

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      await adminContentAPI.toggleFeatured(productId, !currentFeatured);
      setProducts(products.map(p => p.id === productId ? { ...p, featured: !currentFeatured } : p));
      toast({
        title: `Product ${!currentFeatured ? 'marked as' : 'removed from'} featured!`,
      });
    } catch (error) {
      console.error("Failed to toggle featured status:", error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  const handleToggleNewArrival = async (productId: string, currentNewArrival: boolean) => {
    try {
      await adminContentAPI.toggleNewArrival(productId, !currentNewArrival);
      setProducts(products.map(p => p.id === productId ? { ...p, new_arrival: !currentNewArrival } : p));
      toast({
        title: `Product ${!currentNewArrival ? 'marked as' : 'removed from'} new arrivals!`,
      });
    } catch (error) {
      console.error("Failed to toggle new arrival status:", error);
      toast({
        title: "Error",
        description: "Failed to update new arrival status",
        variant: "destructive",
      });
    }
  };

  // Load products when featured tab is active
  useEffect(() => {
    console.log("Featured tab useEffect triggered, activeSection:", activeSection, "products.length:", products.length);
    if (activeSection === "featured" && products.length === 0) {
      console.log("Loading products...");
      loadProducts();
    }
  }, [activeSection]);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void, path: string = "content") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await adminContentAPI.uploadMedia(file, path);
      if (response.success && response.data?.url) {
        // Use the relative path for storage (url), not the absolute URL
        callback(response.data.url);
        toast({
          title: "Upload successful",
        });
      }
    } catch (error) {
      console.error("Failed to upload media:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const sections = [
    { id: "hero", label: "Hero Section" },
    { id: "categories", label: "Categories" },
    { id: "about", label: "Reels Section" },
    { id: "newsletter", label: "Newsletter" },
    { id: "classes", label: "Classes" },
    { id: "featured", label: "Featured & New Arrivals" },
    { id: "settings", label: "Settings" },
  ];

  const inputClass =
    "w-full px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary";
  const labelClass =
    "text-xs font-medium text-muted-foreground mb-1 block";

  if (loading) {
    return (
      <p className="text-muted-foreground text-center py-10">
        Loading content...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-sm overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 text-sm font-medium rounded-sm whitespace-nowrap transition-colors ${
              activeSection === s.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Hero */}
      {activeSection === "hero" && (
        <div className="bg-card border border-border rounded-sm p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Hero Section</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Tagline</label><input value={hero.tagline || ""} onChange={e => setHero({ ...hero, tagline: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Title (Line 1)</label><input value={hero.title || ""} onChange={e => setHero({ ...hero, title: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Title Accent (Line 2)</label><input value={hero.title_accent || ""} onChange={e => setHero({ ...hero, title_accent: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>CTA Button Text</label><input value={hero.cta_text || ""} onChange={e => setHero({ ...hero, cta_text: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Secondary Button Text</label><input value={hero.cta2_text || ""} onChange={e => setHero({ ...hero, cta2_text: e.target.value })} className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Description</label><textarea value={hero.description || ""} onChange={e => setHero({ ...hero, description: e.target.value })} className={inputClass + " min-h-[80px]"} /></div>
          <div>
            <label className={labelClass}>Hero Video</label>
            <div className="flex items-center gap-3">
              {hero.video_url && (
                <video
                  src={getImageUrl(hero.video_url)}
                  className="w-24 h-14 object-cover rounded-sm border border-border"
                  muted
                  playsInline
                />
              )}
              <label className="flex items-center gap-2 px-4 py-2 border border-input rounded-sm text-sm cursor-pointer hover:bg-secondary">
                <Upload size={14} /> {uploading ? "Uploading..." : "Upload Video"}
                <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" className="hidden" onChange={e => handleMediaUpload(e, url => setHero({ ...hero, video_url: url }), "hero")} />
              </label>
              {hero.video_url && <button onClick={() => setHero({ ...hero, video_url: "" })} className="text-xs text-destructive hover:underline">Remove</button>}
            </div>
          </div>
          <button onClick={() => saveSection("hero", hero)} disabled={saving === "hero"} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 disabled:opacity-50">
            <Save size={14} /> {saving === "hero" ? "Saving..." : "Save Hero"}
          </button>
        </div>
      )}

      {/* Categories */}
      {activeSection === "categories" && (
        <div className="bg-card border border-border rounded-sm p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Categories</h3>
          {(categories.items || []).map((cat: any, idx: number) => (
            <div key={idx} className="border border-border rounded-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Category {idx + 1}</span>
                <button onClick={() => setCategories({ ...categories, items: categories.items.filter((_: any, i: number) => i !== idx) })} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className={labelClass}>Name</label><input value={cat.name || ""} onChange={e => { const items = [...categories.items]; items[idx] = { ...items[idx], name: e.target.value }; setCategories({ ...categories, items }); }} className={inputClass} /></div>
                <div><label className={labelClass}>Description</label><input value={cat.description || ""} onChange={e => { const items = [...categories.items]; items[idx] = { ...items[idx], description: e.target.value }; setCategories({ ...categories, items }); }} className={inputClass} /></div>
              </div>
              <div>
                <label className={labelClass}>Image</label>
                <div className="flex items-center gap-3">
                  {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-16 h-16 object-cover rounded-sm border border-border" />}
                  <label className="flex items-center gap-2 px-3 py-2 border border-input rounded-sm text-xs cursor-pointer hover:bg-secondary">
                    <Upload size={12} /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleMediaUpload(e, url => { const items = [...categories.items]; items[idx] = { ...items[idx], image_url: url }; setCategories({ ...categories, items }); }, "categories")} />
                  </label>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => setCategories({ ...categories, items: [...(categories.items || []), { name: "", description: "", image_url: "" }] })} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus size={12} /> Add Category
          </button>
          <button onClick={() => saveSection("categories", categories)} disabled={saving === "categories"} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 disabled:opacity-50">
            <Save size={14} /> {saving === "categories" ? "Saving..." : "Save Categories"}
          </button>
        </div>
      )}

      {/* Reels */}
      {activeSection === "about" && (
        <div className="bg-card border border-border rounded-sm p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Reels Section</h3>
          <h4 className="text-sm font-medium text-foreground pt-2">Reels</h4>
          {(about.reels || []).map((reel: any, idx: number) => (
            <div key={idx} className="border border-border rounded-sm p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Reel {idx + 1}</span>
                <button onClick={() => setAbout({ ...about, reels: about.reels.filter((_: any, i: number) => i !== idx) })} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div><label className={labelClass}>Title</label><input value={reel.title || ""} onChange={e => { const reels = [...about.reels]; reels[idx] = { ...reels[idx], title: e.target.value }; setAbout({ ...about, reels }); }} className={inputClass} /></div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Reel Video</label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 px-3 py-2 border border-input rounded-sm text-xs cursor-pointer hover:bg-secondary">
                    <Upload size={12} /> {uploading ? "Uploading..." : "Upload Video"}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      className="hidden"
                      onChange={e => handleMediaUpload(e, url => {
                        const reels = [...about.reels];
                        reels[idx] = { ...reels[idx], video_url: url };
                        setAbout({ ...about, reels });
                      }, "reels")}
                    />
                  </label>
                  {reel.video_url && <button onClick={() => { const reels = [...about.reels]; reels[idx] = { ...reels[idx], video_url: "" }; setAbout({ ...about, reels }); }} className="text-xs text-destructive hover:underline">Remove</button>}
                </div>
                {reel.video_url ? (
                  <video
                    src={getImageUrl(reel.video_url)}
                    controls
                    preload="metadata"
                    className="w-28 h-44 object-cover rounded-sm border border-border"
                  />
                ) : null}
              </div>
            </div>
          ))}
          <button onClick={() => setAbout({ ...about, reels: [...(about.reels || []), { title: "", video_url: "" }] })} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus size={12} /> Add Reel
          </button>
          <button onClick={() => saveSection("about", about)} disabled={saving === "about"} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 disabled:opacity-50">
            <Save size={14} /> {saving === "about" ? "Saving..." : "Save Reels"}
          </button>
        </div>
      )}

      {/* Classes */}
      {activeSection === "classes" && (
        <div className="bg-card border border-border rounded-sm p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Classes</h3>
          {(classes.items || []).map((cls: any, idx: number) => (
            <div key={idx} className="border border-border rounded-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Class {idx + 1}</span>
                <button onClick={() => setClasses({ ...classes, items: classes.items.filter((_: any, i: number) => i !== idx) })} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2"><label className={labelClass}>Title</label><input value={cls.title || ""} onChange={e => { const items = [...classes.items]; items[idx] = { ...items[idx], title: e.target.value }; setClasses({ ...classes, items }); }} className={inputClass} placeholder="Class Title" /></div>
                <div><label className={labelClass}>Start Date</label><input type="date" value={cls.start_date || ""} onChange={e => { const items = [...classes.items]; items[idx] = { ...items[idx], start_date: e.target.value }; setClasses({ ...classes, items }); }} className={inputClass} /></div>
                <div><label className={labelClass}>End Date</label><input type="date" value={cls.end_date || ""} onChange={e => { const items = [...classes.items]; items[idx] = { ...items[idx], end_date: e.target.value }; setClasses({ ...classes, items }); }} className={inputClass} /></div>
              </div>
            </div>
          ))}
          <button onClick={() => setClasses({ ...classes, items: [...(classes.items || []), { title: "", start_date: "", end_date: "" }] })} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus size={12} /> Add Class
          </button>
          <button onClick={() => saveSection("classes", classes)} disabled={saving === "classes"} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 disabled:opacity-50">
            <Save size={14} /> {saving === "classes" ? "Saving..." : "Save Classes"}
          </button>
        </div>
      )}

      {/* Newsletter */}
      {activeSection === "newsletter" && (
        <div className="bg-card border border-border rounded-sm p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Newsletter Section</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Tagline</label><input value={newsletter.tagline || ""} onChange={e => setNewsletter({ ...newsletter, tagline: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Title</label><input value={newsletter.title || ""} onChange={e => setNewsletter({ ...newsletter, title: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Button Text</label><input value={newsletter.button_text || ""} onChange={e => setNewsletter({ ...newsletter, button_text: e.target.value })} className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Description</label><textarea value={newsletter.description || ""} onChange={e => setNewsletter({ ...newsletter, description: e.target.value })} className={inputClass + " min-h-[80px]"} /></div>
          <button onClick={() => saveSection("newsletter", newsletter)} disabled={saving === "newsletter"} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 disabled:opacity-50">
            <Save size={14} /> {saving === "newsletter" ? "Saving..." : "Save Newsletter"}
          </button>
        </div>
      )}

      {/* Featured Products */}
      {activeSection === "featured" && (
        <div className="bg-card border border-border rounded-sm p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Featured & New Arrivals</h3>
          <p className="text-sm text-muted-foreground">Toggle products to show them in Featured Products and New Arrivals on the main page</p>
          
          {productsLoading ? (
            <p className="text-muted-foreground text-center py-10">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No products available</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {products.map((product: any) => (
                <div key={product.id} className="border border-border rounded-sm p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {product.image_url && (
                      <img 
                        src={getImageUrl(product.image_url)} 
                        alt={product.name} 
                        className="w-12 h-12 object-cover rounded-sm"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">Rs. {product.price?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleNewArrival(product.id, !!product.new_arrival)}
                      className={`px-4 py-2 text-xs font-medium rounded-sm whitespace-nowrap transition-colors ${
                        product.new_arrival
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {product.new_arrival ? "New Arrival ✓" : "Not New Arrival"}
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(product.id, product.featured)}
                      className={`px-4 py-2 text-xs font-medium rounded-sm whitespace-nowrap transition-colors ${
                        product.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {product.featured ? "Featured ✓" : "Not Featured"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      {activeSection === "settings" && (
        <div className="bg-card border border-border rounded-sm p-6 space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">General Settings</h3>
          
          {/* Logo & Branding */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3 border-b border-border pb-2">Logo & Branding</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Site Logo</label>
                <div className="flex items-center gap-3">
                  {settings.logo_url && <img src={getImageUrl(settings.logo_url)} alt="Logo" className="h-14 w-auto border border-border rounded-sm p-1 bg-background" />}
                  <label className="flex items-center gap-2 px-4 py-2 border border-input rounded-sm text-sm cursor-pointer hover:bg-secondary">
                    <Upload size={14} /> {uploading ? "Uploading..." : "Upload Logo"}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleMediaUpload(e, url => setSettings({ ...settings, logo_url: url }), "settings")} />
                  </label>
                  {settings.logo_url && <button onClick={() => setSettings({ ...settings, logo_url: "" })} className="text-xs text-destructive hover:underline">Remove</button>}
                </div>
              </div>
              <div><label className={labelClass}>Tagline (below logo)</label><input value={settings.navbar_tagline || ""} onChange={e => setSettings({ ...settings, navbar_tagline: e.target.value })} className={inputClass} placeholder="for the beautiful you" /></div>
            </div>
          </div>

          {/* Store Info */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3 border-b border-border pb-2">Store Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Store Name</label><input value={settings.store_name || ""} onChange={e => setSettings({ ...settings, store_name: e.target.value })} className={inputClass} placeholder="W7 Nepal" /></div>
              <div><label className={labelClass}>Footer Tagline</label><input value={settings.footer_tagline || ""} onChange={e => setSettings({ ...settings, footer_tagline: e.target.value })} className={inputClass} placeholder="for the beautiful you" /></div>
              <div className="sm:col-span-2"><label className={labelClass}>Footer Description</label><textarea value={settings.footer_description || ""} onChange={e => setSettings({ ...settings, footer_description: e.target.value })} className={inputClass + " min-h-[60px]"} placeholder="Short description for the footer" /></div>
              <div className="sm:col-span-2"><label className={labelClass}>Copyright Text</label><input value={settings.copyright_text || ""} onChange={e => setSettings({ ...settings, copyright_text: e.target.value })} className={inputClass} placeholder="© 2026 W7 Nepal. All rights reserved." /></div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3 border-b border-border pb-2">Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Phone Number</label><input value={settings.phone || ""} onChange={e => setSettings({ ...settings, phone: e.target.value })} className={inputClass} placeholder="+977-9800000000" /></div>
              <div><label className={labelClass}>Email Address</label><input value={settings.email || ""} onChange={e => setSettings({ ...settings, email: e.target.value })} className={inputClass} placeholder="hello@w7nepal.com" /></div>
              <div><label className={labelClass}>Location</label><input value={settings.location || ""} onChange={e => setSettings({ ...settings, location: e.target.value })} className={inputClass} placeholder="Kathmandu, Nepal" /></div>
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3 border-b border-border pb-2">WhatsApp</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>WhatsApp Number</label>
                <input value={settings.whatsapp_number || ""} onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })} className={inputClass} placeholder="9779800000000" />
                <p className="text-xs text-muted-foreground mt-1">Include country code without + (e.g. 9779800000000)</p>
              </div>
              <div><label className={labelClass}>Default Message</label><input value={settings.whatsapp_message || ""} onChange={e => setSettings({ ...settings, whatsapp_message: e.target.value })} className={inputClass} placeholder="Hi! I have a question about your products." /></div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3 border-b border-border pb-2">Social Media Links</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={labelClass}>Instagram URL</label><input value={settings.instagram_url || ""} onChange={e => setSettings({ ...settings, instagram_url: e.target.value })} className={inputClass} placeholder="https://instagram.com/..." /></div>
              <div><label className={labelClass}>Facebook URL</label><input value={settings.facebook_url || ""} onChange={e => setSettings({ ...settings, facebook_url: e.target.value })} className={inputClass} placeholder="https://facebook.com/..." /></div>
              <div><label className={labelClass}>TikTok URL</label><input value={settings.tiktok_url || ""} onChange={e => setSettings({ ...settings, tiktok_url: e.target.value })} className={inputClass} placeholder="https://tiktok.com/@..." /></div>
            </div>
          </div>

          <button onClick={() => saveSection("settings", settings)} disabled={saving === "settings"} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 disabled:opacity-50">
            <Save size={14} /> {saving === "settings" ? "Saving..." : "Save Settings"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
