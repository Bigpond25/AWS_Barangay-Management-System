-- PostgreSQL Setup Script for AWS Barangay Management System
-- Run these commands in PostgreSQL command line or pgAdmin

-- Create database
CREATE DATABASE barangay_management;

-- Create user for the application
CREATE USER barangay_user WITH PASSWORD 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE barangay_management TO barangay_user;

-- Connect to the database
\c barangay_management;

-- Enable UUID extension (required for UUID primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO barangay_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO barangay_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO barangay_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO barangay_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO barangay_user;

-- Verify setup
SELECT version();
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
