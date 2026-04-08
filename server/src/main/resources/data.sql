INSERT INTO notification (notification_time, is_remember)
SELECT '09:00:00', FALSE
WHERE NOT EXISTS (
    SELECT 1 FROM notification
);