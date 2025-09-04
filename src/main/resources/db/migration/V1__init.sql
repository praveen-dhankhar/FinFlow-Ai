-- Initial Flyway migration
CREATE TABLE IF NOT EXISTS example (
	id BIGINT PRIMARY KEY,
	name VARCHAR(255) NOT NULL
);
