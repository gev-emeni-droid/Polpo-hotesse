#!/bin/bash
# Script to export all data from old D1 and import to new D1

OLD_DB_ID="ad5a16d1-aa3d-4780-92dc-d7ecef6bb6ea"
NEW_DB_ID="f0393625-4e82-4ea7-9bc3-94f5af444a65"

echo "📊 Exporting data from old D1..."

# Export all tables from old D1
wrangler d1 execute ${OLD_DB_ID} \
  --remote \
  --output=json > old_d1_export.json

if [ $? -ne 0 ]; then
  echo "❌ Error exporting from old D1"
  exit 1
fi

echo "✅ Export complete"
echo "📝 File: old_d1_export.json"
echo ""
echo "🔄 To import the data:"
echo "1. Copy the exported data"
echo "2. Send a POST request to: https://your-site.pages.dev/api/hotesse/migrate"
echo "3. With body: { tables: [...] }"
