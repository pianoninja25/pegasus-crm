-- Grants for the non-superuser app role.
--
-- The role itself is created by docker/postgres-init/01-app-user.sh on
-- first-boot of the Postgres container. Here we grant it the table-level
-- privileges it needs at runtime, plus ALTER DEFAULT PRIVILEGES so future
-- tables/sequences created by the superuser are automatically usable.
--
-- Idempotent: if the app role happens not to exist yet (e.g. in a bare
-- test environment where the init script didn't run), we create it here
-- with a default password. Production deploys should always run the init
-- script so the password comes from PEGASUS_APP_PASSWORD.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'pegasus_app') THEN
        CREATE ROLE pegasus_app LOGIN PASSWORD 'pegasus_app_dev'
            NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
    END IF;
END
$$;
--> statement-breakpoint

GRANT USAGE ON SCHEMA public TO pegasus_app;
--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE
    ON ALL TABLES IN SCHEMA public
    TO pegasus_app;
--> statement-breakpoint

GRANT USAGE, SELECT, UPDATE
    ON ALL SEQUENCES IN SCHEMA public
    TO pegasus_app;
--> statement-breakpoint

-- Anything the superuser creates later inherits these privileges.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO pegasus_app;
--> statement-breakpoint

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO pegasus_app;
--> statement-breakpoint

-- Execute privilege on the RLS helper functions from migration 0002.
GRANT EXECUTE ON FUNCTION app_current_tenant() TO pegasus_app;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION app_is_superadmin() TO pegasus_app;
