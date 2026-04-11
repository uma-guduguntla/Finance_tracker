-- Clean orphaned rows on startup
DELETE FROM leak_explanations WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM expenses WHERE user_id NOT IN (SELECT id FROM users);
