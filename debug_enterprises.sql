-- Debug endpoint to check all enterprises created
SELECT 
  id,
  nom,
  type,
  created_at
FROM hotesse_clients
WHERE type = 'entreprise'
ORDER BY created_at DESC
LIMIT 20;
