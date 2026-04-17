-- Site content table for managing site sections (hero, categories, about, newsletter, settings)
CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section VARCHAR(100) UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create index on section for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
CREATE INDEX IF NOT EXISTS idx_site_content_created_at ON site_content(created_at);

-- Insert default sections with sample content
INSERT INTO site_content (section, content) VALUES
(
    'hero',
    '{
        "tagline": "Your Beauty Destination in Nepal",
        "title": "Unleash Your",
        "title_accent": "Inner Glow",
        "description": "Shop authentic colour cosmetics, skincare & beauty essentials. Delivered across Nepal.",
        "cta_text": "Shop Now",
        "cta2_text": "Explore Categories",
        "image_url": ""
    }'::JSONB
),
(
    'categories',
    '{
        "items": [
            {"name": "Face", "description": "Foundations, Blush & Highlight", "image_url": ""},
            {"name": "Eyes", "description": "Palettes, Mascaras & Liners", "image_url": ""},
            {"name": "Lips", "description": "Lipsticks, Glosses & Liners", "image_url": ""},
            {"name": "Nails", "description": "Nail Polish, Gel & Art", "image_url": ""},
            {"name": "Tools & Accessories", "description": "Brushes, Sponges & More", "image_url": ""}
        ]
    }'::JSONB
),
(
    'about',
    '{
        "tagline": "Why Choose Us",
        "title": "Authorized W7 Reseller in Nepal",
        "description": "We are the official authorized reseller of W7 Cosmetics in Nepal. Every product is 100% genuine, PETA cruelty-free certified, and carefully curated for you.",
        "features": [
            {"title": "100% Authentic", "desc": "Genuine W7 beauty products — authorized reseller in Nepal", "icon": "Shield"},
            {"title": "PETA Cruelty-Free", "desc": "W7 is PETA-certified cruelty-free. No animal testing.", "icon": "Leaf", "link": "https://crueltyfree.peta.org/company/w7-cosmetics/"},
            {"title": "Authorized W7 Reseller", "desc": "Official authorized reseller of W7 Cosmetics in Nepal", "icon": "Award"},
            {"title": "Nepal-Wide Delivery", "desc": "Fast delivery across all major cities in Nepal", "icon": "Truck"},
            {"title": "Best Prices", "desc": "Affordable luxury cosmetics without breaking the bank", "icon": "Star"},
            {"title": "Based in Kathmandu", "desc": "Local support with easy returns and exchanges", "icon": "MapPin"}
        ]
    }'::JSONB
),
(
    'newsletter',
    '{
        "tagline": "Stay Updated",
        "title": "Join Our Beauty Circle",
        "description": "Subscribe to get exclusive deals, new arrivals, and beauty tips delivered straight to your inbox.",
        "button_text": "Subscribe"
    }'::JSONB
),
(
    'settings',
    '{
        "store_name": "W7 Nepal",
        "navbar_tagline": "for the beautiful you",
        "footer_tagline": "for the beautiful you",
        "footer_description": "Your trusted authorized W7 Cosmetics reseller in Nepal",
        "copyright_text": "© 2026 W7 Nepal. All rights reserved.",
        "phone": "+977-9800000000",
        "email": "hello@w7nepal.com",
        "location": "Kathmandu, Nepal",
        "whatsapp_number": "9779800000000",
        "whatsapp_message": "Hi! I have a question about your products.",
        "instagram_url": "https://instagram.com/w7nepal",
        "facebook_url": "https://facebook.com/w7nepal",
        "tiktok_url": "https://tiktok.com/@w7nepal",
        "logo_url": ""
    }'::JSONB
)
ON CONFLICT (section) DO NOTHING;
