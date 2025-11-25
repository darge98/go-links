#!/bin/bash
set -e

if [ "$SEED_DATA" = "true" ]; then
  echo "🌱 Seeding database with sample data..."
  
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Insert sample GoLinks (Development & Tools)
    INSERT INTO golink (id, name, target_url, description, tags, created_at, updated_at, lock_uuid) VALUES
    (gen_random_uuid(), 'github', 'https://github.com', 'GitHub', '{"dev","git","vcs"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'gitlab', 'https://gitlab.com', 'GitLab', '{"dev","git","vcs"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'stackoverflow', 'https://stackoverflow.com', 'Stack Overflow', '{"dev","help","qa"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'mdn', 'https://developer.mozilla.org', 'MDN Web Docs', '{"dev","docs","reference"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'npm', 'https://npmjs.com', 'NPM Registry', '{"dev","packages","javascript"}', NOW(), NOW(), gen_random_uuid()),
    
    -- Google Services
    (gen_random_uuid(), 'docs', 'https://docs.google.com', 'Google Docs', '{"productivity","google","documents"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'drive', 'https://drive.google.com', 'Google Drive', '{"productivity","google","storage"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'gmail', 'https://mail.google.com', 'Gmail', '{"email","google","communication"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'calendar', 'https://calendar.google.com', 'Google Calendar', '{"productivity","google","scheduling"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'meet', 'https://meet.google.com', 'Google Meet', '{"video","google","communication"}', NOW(), NOW(), gen_random_uuid()),
    
    -- Communication & Collaboration
    (gen_random_uuid(), 'slack', 'https://slack.com', 'Slack', '{"communication","chat","team"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'teams', 'https://teams.microsoft.com', 'Microsoft Teams', '{"communication","microsoft","video"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'zoom', 'https://zoom.us', 'Zoom', '{"video","communication","meetings"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'discord', 'https://discord.com', 'Discord', '{"communication","chat","community"}', NOW(), NOW(), gen_random_uuid()),
    
    -- Project Management
    (gen_random_uuid(), 'jira', 'https://atlassian.com/software/jira', 'Jira', '{"project","management","agile"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'trello', 'https://trello.com', 'Trello', '{"project","management","kanban"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'notion', 'https://notion.so', 'Notion', '{"productivity","notes","wiki"}', NOW(), NOW(), gen_random_uuid()),
    
    -- Design & Creative
    (gen_random_uuid(), 'figma', 'https://figma.com', 'Figma', '{"design","ui","collaboration"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'canva', 'https://canva.com', 'Canva', '{"design","graphics","templates"}', NOW(), NOW(), gen_random_uuid()),
    
    -- Social & Media
    (gen_random_uuid(), 'linkedin', 'https://linkedin.com', 'LinkedIn', '{"social","professional","networking"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'twitter', 'https://twitter.com', 'Twitter / X', '{"social","news","microblogging"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'youtube', 'https://youtube.com', 'YouTube', '{"video","media","streaming"}', NOW(), NOW(), gen_random_uuid()),
    
    -- Learning & Resources
    (gen_random_uuid(), 'coursera', 'https://coursera.org', 'Coursera', '{"learning","courses","education"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'udemy', 'https://udemy.com', 'Udemy', '{"learning","courses","education"}', NOW(), NOW(), gen_random_uuid()),
    (gen_random_uuid(), 'wiki', 'https://en.wikipedia.org', 'Wikipedia', '{"reference","knowledge","encyclopedia"}', NOW(), NOW(), gen_random_uuid());
    
    -- Insert sample events for analytics (varied distribution)
    -- High traffic links
    INSERT INTO event (id, golink_id, created_at, ip_address, user_agent, referrer)
    SELECT 
      gen_random_uuid(),
      (SELECT id FROM golink WHERE name = 'github'),
      NOW() - (random() * interval '60 days'),
      '127.0.0.' || floor(random() * 255)::text,
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'http://localhost'
    FROM generate_series(1, 150);
    
    INSERT INTO event (id, golink_id, created_at, ip_address, user_agent, referrer)
    SELECT 
      gen_random_uuid(),
      (SELECT id FROM golink WHERE name = 'docs'),
      NOW() - (random() * interval '60 days'),
      '127.0.0.' || floor(random() * 255)::text,
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'http://localhost'
    FROM generate_series(1, 120);
    
    INSERT INTO event (id, golink_id, created_at, ip_address, user_agent, referrer)
    SELECT 
      gen_random_uuid(),
      (SELECT id FROM golink WHERE name = 'slack'),
      NOW() - (random() * interval '60 days'),
      '127.0.0.' || floor(random() * 255)::text,
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      'http://localhost'
    FROM generate_series(1, 110);
    
    -- Medium traffic links
    INSERT INTO event (id, golink_id, created_at, ip_address, user_agent, referrer)
    SELECT 
      gen_random_uuid(),
      (SELECT id FROM golink WHERE name = 'jira'),
      NOW() - (random() * interval '60 days'),
      '127.0.0.' || floor(random() * 255)::text,
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'http://localhost'
    FROM generate_series(1, 85);
    
    INSERT INTO event (id, golink_id, created_at, ip_address, user_agent, referrer)
    SELECT 
      gen_random_uuid(),
      (SELECT id FROM golink WHERE name = 'stackoverflow'),
      NOW() - (random() * interval '60 days'),
      '127.0.0.' || floor(random() * 255)::text,
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'http://localhost'
    FROM generate_series(1, 75);
    
    INSERT INTO event (id, golink_id, created_at, ip_address, user_agent, referrer)
    SELECT 
      gen_random_uuid(),
      (SELECT id FROM golink WHERE name = 'drive'),
      NOW() - (random() * interval '60 days'),
      '127.0.0.' || floor(random() * 255)::text,
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'http://localhost'
    FROM generate_series(1, 65);
    
    -- Lower traffic links
    INSERT INTO event (id, golink_id, created_at, ip_address, user_agent, referrer)
    SELECT 
      gen_random_uuid(),
      (SELECT id FROM golink WHERE name = 'figma'),
      NOW() - (random() * interval '60 days'),
      '127.0.0.' || floor(random() * 255)::text,
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'http://localhost'
    FROM generate_series(1, 45);
    
    INSERT INTO event (id, golink_id, created_at, ip_address, user_agent, referrer)
    SELECT 
      gen_random_uuid(),
      (SELECT id FROM golink WHERE name = 'notion'),
      NOW() - (random() * interval '60 days'),
      '127.0.0.' || floor(random() * 255)::text,
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      'http://localhost'
    FROM generate_series(1, 40);
    
    INSERT INTO event (id, golink_id, created_at, ip_address, user_agent, referrer)
    SELECT 
      gen_random_uuid(),
      (SELECT id FROM golink WHERE name = 'youtube'),
      NOW() - (random() * interval '60 days'),
      '127.0.0.' || floor(random() * 255)::text,
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'http://localhost'
    FROM generate_series(1, 30);
    
    INSERT INTO event (id, golink_id, created_at, ip_address, user_agent, referrer)
    SELECT 
      gen_random_uuid(),
      (SELECT id FROM golink WHERE name = 'wiki'),
      NOW() - (random() * interval '60 days'),
      '127.0.0.' || floor(random() * 255)::text,
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'http://localhost'
    FROM generate_series(1, 25);
EOSQL
  
  echo "✅ Database seeding completed!"
else
  echo "ℹ️  Skipping database seeding (SEED_DATA not set to 'true')"
fi
