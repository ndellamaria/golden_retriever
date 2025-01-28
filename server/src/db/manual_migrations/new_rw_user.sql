-- Create database
CREATE DATABASE golden_retriever;

-- Create new user
CREATE USER golden_retriever_rw WITH PASSWORD 'REDACTED';

-- Grant necessary permissions
GRANT CONNECT ON DATABASE golden_retriever TO golden_retriever_rw;
GRANT USAGE ON SCHEMA public TO golden_retriever_rw;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO golden_retriever_rw;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO golden_retriever_rw;
ALTER USER golden_retriever_rw CREATEDB;
GRANT ALL ON SCHEMA public TO golden_retriever_rw;

-- For future tables (important for Prisma)
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT SELECT, INSERT, UPDATE ON TABLES TO golden_retriever_rw;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT USAGE, SELECT ON SEQUENCES TO golden_retriever_rw;