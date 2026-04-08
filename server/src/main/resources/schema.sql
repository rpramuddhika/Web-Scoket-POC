CREATE TABLE IF NOT EXISTS notification (
    id BIGINT NOT NULL AUTO_INCREMENT,
    notification_time TIME NOT NULL,
    is_remember BOOLEAN NOT NULL,
    PRIMARY KEY (id)
);