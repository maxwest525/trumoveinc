
-- Delete all duplicate Marcus Rivera leads except the most recent one
DELETE FROM leads 
WHERE id IN (
  SELECT id FROM leads 
  WHERE first_name = 'Marcus' AND last_name = 'Rivera'
  ORDER BY created_at DESC
  OFFSET 1
);

-- Delete test/junk records
DELETE FROM leads WHERE first_name IN ('asd', 'xcv');

-- Also clean up any orphaned related records
DELETE FROM deals WHERE lead_id NOT IN (SELECT id FROM leads);
DELETE FROM activities WHERE lead_id IS NOT NULL AND lead_id NOT IN (SELECT id FROM leads);
DELETE FROM esign_documents WHERE lead_id NOT IN (SELECT id FROM leads);
DELETE FROM esign_audit_trail WHERE lead_id IS NOT NULL AND lead_id NOT IN (SELECT id FROM leads);
DELETE FROM move_details WHERE lead_id NOT IN (SELECT id FROM leads);
DELETE FROM lead_inventory WHERE lead_id NOT IN (SELECT id FROM leads);
DELETE FROM customer_portal_access WHERE lead_id IS NOT NULL AND lead_id NOT IN (SELECT id FROM leads);
