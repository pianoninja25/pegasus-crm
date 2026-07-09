-- Row-Level Security for Pegasus CRM
--
-- Every tenant-scoped table gets:
--   1. RLS enabled + FORCED (applies to the table owner too — the app connects
--      as the `pegasus` role which owns the tables, so without FORCE the app
--      would bypass all policies).
--   2. A single FOR ALL policy that grants access when either:
--        a) current_setting('app.tenant_id') matches the row's tenant_id, OR
--        b) current_setting('app.role') = 'superadmin'  (platform bypass)
--
-- The `tenants` and `users` tables use slightly different rules:
--   - Any authenticated context can read its own tenant row.
--   - Only superadmin can read across tenants.
--   - `users.tenant_id` is nullable (platform superadmin has no tenant), so
--     the platform-user rows are visible only to superadmin.
--
-- To set a scope on a connection, run inside a transaction:
--     SET LOCAL app.tenant_id = 't_pegasus_ac';
--     SET LOCAL app.role      = 'user';
-- Or, for a superadmin request:
--     SET LOCAL app.role      = 'superadmin';
--
-- The helpers in `src/db/tenant-scope.ts` wrap this pattern.

-- ---------------------------------------------------------------------------
-- Helper: read the current_setting safely (returns NULL if unset)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_current_tenant() RETURNS text AS $$
  SELECT current_setting('app.tenant_id', true);
$$ LANGUAGE sql STABLE;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION app_is_superadmin() RETURNS boolean AS $$
  SELECT current_setting('app.role', true) = 'superadmin';
$$ LANGUAGE sql STABLE;
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- tenants  — tenant users see only their own tenant; superadmin sees all
-- ---------------------------------------------------------------------------
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenants_access ON tenants
  FOR ALL
  USING (id = app_current_tenant() OR app_is_superadmin())
  WITH CHECK (id = app_current_tenant() OR app_is_superadmin());
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- users — tenant users see only their tenant's users; superadmin sees all.
-- Platform superadmin users (tenant_id IS NULL) are visible only to superadmin.
-- ---------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE users FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY users_access ON users
  FOR ALL
  USING (
    (tenant_id IS NOT NULL AND tenant_id = app_current_tenant())
    OR app_is_superadmin()
  )
  WITH CHECK (
    (tenant_id IS NOT NULL AND tenant_id = app_current_tenant())
    OR app_is_superadmin()
  );
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- Generic tenant-scoped tables: identical policy pattern.
-- ---------------------------------------------------------------------------
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE customers FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY customers_tenant_isolation ON customers
  FOR ALL
  USING (tenant_id = app_current_tenant() OR app_is_superadmin())
  WITH CHECK (tenant_id = app_current_tenant() OR app_is_superadmin());
--> statement-breakpoint

ALTER TABLE ac_units ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE ac_units FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY ac_units_tenant_isolation ON ac_units
  FOR ALL
  USING (tenant_id = app_current_tenant() OR app_is_superadmin())
  WITH CHECK (tenant_id = app_current_tenant() OR app_is_superadmin());
--> statement-breakpoint

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE quotations FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY quotations_tenant_isolation ON quotations
  FOR ALL
  USING (tenant_id = app_current_tenant() OR app_is_superadmin())
  WITH CHECK (tenant_id = app_current_tenant() OR app_is_superadmin());
--> statement-breakpoint

ALTER TABLE quotation_lines ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE quotation_lines FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY quotation_lines_tenant_isolation ON quotation_lines
  FOR ALL
  USING (tenant_id = app_current_tenant() OR app_is_superadmin())
  WITH CHECK (tenant_id = app_current_tenant() OR app_is_superadmin());
--> statement-breakpoint

ALTER TABLE service_contracts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE service_contracts FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY service_contracts_tenant_isolation ON service_contracts
  FOR ALL
  USING (tenant_id = app_current_tenant() OR app_is_superadmin())
  WITH CHECK (tenant_id = app_current_tenant() OR app_is_superadmin());
--> statement-breakpoint

ALTER TABLE service_contract_units ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE service_contract_units FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY service_contract_units_tenant_isolation ON service_contract_units
  FOR ALL
  USING (tenant_id = app_current_tenant() OR app_is_superadmin())
  WITH CHECK (tenant_id = app_current_tenant() OR app_is_superadmin());
--> statement-breakpoint

ALTER TABLE service_visits ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE service_visits FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY service_visits_tenant_isolation ON service_visits
  FOR ALL
  USING (tenant_id = app_current_tenant() OR app_is_superadmin())
  WITH CHECK (tenant_id = app_current_tenant() OR app_is_superadmin());
--> statement-breakpoint

ALTER TABLE service_visit_units ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE service_visit_units FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY service_visit_units_tenant_isolation ON service_visit_units
  FOR ALL
  USING (tenant_id = app_current_tenant() OR app_is_superadmin())
  WITH CHECK (tenant_id = app_current_tenant() OR app_is_superadmin());
--> statement-breakpoint

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY invoices_tenant_isolation ON invoices
  FOR ALL
  USING (tenant_id = app_current_tenant() OR app_is_superadmin())
  WITH CHECK (tenant_id = app_current_tenant() OR app_is_superadmin());
--> statement-breakpoint

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE expenses FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY expenses_tenant_isolation ON expenses
  FOR ALL
  USING (tenant_id = app_current_tenant() OR app_is_superadmin())
  WITH CHECK (tenant_id = app_current_tenant() OR app_is_superadmin());
--> statement-breakpoint

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY notifications_tenant_isolation ON notifications
  FOR ALL
  USING (tenant_id = app_current_tenant() OR app_is_superadmin())
  WITH CHECK (tenant_id = app_current_tenant() OR app_is_superadmin());
