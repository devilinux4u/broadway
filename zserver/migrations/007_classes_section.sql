-- Add classes section to site_content
INSERT INTO site_content (section, content) VALUES
(
    'classes',
    '{
        "items": [
            {
                "title": "Basic Graphics Design",
                "start_date": "2024-03-13",
                "end_date": "2024-05-20",
                "start_time": "10:00",
                "end_time": "01:00",
                "credits": "3 Credit",
                "instructor": "John Doe"
            },
            {
                "title": "Basic Colors & Elements",
                "start_date": "2024-03-16",
                "end_date": "2024-05-25",
                "start_time": "03:00",
                "end_time": "05:00",
                "credits": "2 Credit",
                "instructor": "Jane Smith"
            },
            {
                "title": "Advanced UI/UX Design",
                "start_date": "2024-03-20",
                "end_date": "2024-06-10",
                "start_time": "02:00",
                "end_time": "04:00",
                "credits": "4 Credit",
                "instructor": "Mike Johnson"
            },
            {
                "title": "Web Development Fundamentals",
                "start_date": "2024-04-01",
                "end_date": "2024-06-15",
                "start_time": "11:00",
                "end_time": "01:00",
                "credits": "3 Credit",
                "instructor": "Sarah Wilson"
            },
            {
                "title": "Mobile App Development",
                "start_date": "2024-04-05",
                "end_date": "2024-07-20",
                "start_time": "09:00",
                "end_time": "11:00",
                "credits": "5 Credit",
                "instructor": "Alex Brown"
            }
        ]
    }'::JSONB
)
ON CONFLICT (section) DO UPDATE SET content = EXCLUDED.content;
