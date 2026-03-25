-- Clean up old/invalid theme data that might have been stored during development
DELETE FROM hotesse_theme_settings 
WHERE theme_id NOT IN (
  'sage-stone', 'cream-teal', 'deep-navy', 'teal-bright', 'sunny-gold',
  'lavender-gray', 'seafoam-blue', 'deep-mystery', 'sage-warm', 'rose-earth',
  'coral-rose', 'cream-soft', 'teal-stone', 'rose-navy', 'teal-green',
  'gray-lavender', 'earth-warm', 'mauve-taupe', 'coral-deep', 'rose-burgundy',
  'blush-soft', 'sage-soft', 'teal-combo', 'gold-accent'
)
OR theme_id IN ('navy', 'default', 'invalid');

-- Ensure no orphaned theme settings for archived calendars
DELETE FROM hotesse_theme_settings 
WHERE calendar_id NOT IN (SELECT id FROM hotesse_calendars WHERE is_archived = 0);
