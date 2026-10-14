SET lock_timeout = '5s';
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;
