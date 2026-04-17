-- Convert legacy about content (why choose us) to reels structure
UPDATE site_content
SET content = jsonb_build_object('reels', COALESCE(content->'reels', '[]'::jsonb))
WHERE section = 'about';
