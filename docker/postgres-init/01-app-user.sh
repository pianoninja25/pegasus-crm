#!/bin/bash
# Runs once when the Postgres container initialises its data volume.
#
# Creates the non-superuser app role (`pegasus_app` by default) that the
# runtime app connects as. This is critical for RLS: superusers bypass
# every policy, so the app MUST connect as a role without BYPASSRLS.
#
# Table-level GRANTs happen in migration 0003_grant_app_user.sql after
# the schema exists.
set -euo pipefail

APP_USER="${PEGASUS_APP_USER:-pegasus_app}"
APP_PASSWORD="${PEGASUS_APP_PASSWORD:-pegasus_app_dev}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$APP_USER') THEN
            CREATE ROLE $APP_USER LOGIN PASSWORD '$APP_PASSWORD'
                NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
        ELSE
            ALTER ROLE $APP_USER WITH LOGIN PASSWORD '$APP_PASSWORD'
                NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
        END IF;
    END
    \$\$;

    GRANT CONNECT ON DATABASE "$POSTGRES_DB" TO $APP_USER;
    GRANT USAGE ON SCHEMA public TO $APP_USER;
SQL

echo "→ App role '$APP_USER' ready (LOGIN, NOSUPERUSER, NOBYPASSRLS)."
