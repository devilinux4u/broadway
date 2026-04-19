-- Add classes section to site_content
INSERT INTO site_content (section, content) VALUES
(
    'classes',
    '{
        "items": []
    }'::JSONB
)
ON CONFLICT (section) DO NOTHING;
