-- Add AI configuration columns to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS openai_api_key text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS gemini_api_key text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS active_ai_provider text DEFAULT 'none';

-- Update existing row if it exists, otherwise create it
INSERT INTO settings (id, openai_api_key, gemini_api_key, active_ai_provider) 
VALUES (1, null, null, 'none')
ON CONFLICT (id) DO UPDATE SET
  openai_api_key = COALESCE(settings.openai_api_key, EXCLUDED.openai_api_key),
  gemini_api_key = COALESCE(settings.gemini_api_key, EXCLUDED.gemini_api_key),
  active_ai_provider = COALESCE(settings.active_ai_provider, EXCLUDED.active_ai_provider);