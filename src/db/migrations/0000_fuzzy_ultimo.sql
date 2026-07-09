CREATE TYPE "public"."contract_status" AS ENUM('active', 'expiring_soon', 'completed', 'awaiting_renewal', 'draft');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('ac_cleaning', 'ac_replacement', 'spare_part_replacement', 'preventive_maintenance', 'custom');--> statement-breakpoint
CREATE TYPE "public"."customer_type" AS ENUM('residential', 'commercial', 'industrial');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('fuel', 'transport', 'spare_parts', 'tools', 'salaries', 'rent', 'utilities', 'marketing', 'misc');--> statement-breakpoint
CREATE TYPE "public"."income_source" AS ENUM('service_job', 'product_sale', 'spare_part_sale', 'service_contract');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."notification_kind" AS ENUM('upcoming_service', 'expiring_contract', 'quotation_expiring', 'outstanding_payment', 'engineer_assigned', 'daily_schedule', 'overdue_maintenance', 'renewal_reminder');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'bank_transfer', 'credit_card', 'ewallet', 'check');--> statement-breakpoint
CREATE TYPE "public"."quotation_category" AS ENUM('service', 'product', 'spare_parts', 'service_contract');--> statement-breakpoint
CREATE TYPE "public"."quotation_status" AS ENUM('draft', 'sent', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."service_frequency" AS ENUM('monthly', 'quarterly', 'biannual', 'annual', 'custom');--> statement-breakpoint
CREATE TYPE "public"."tenant_plan" AS ENUM('Starter', 'Growth', 'Scale', 'Enterprise');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('trial', 'active', 'past_due', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."unit_condition" AS ENUM('excellent', 'good', 'fair', 'poor');--> statement-breakpoint
CREATE TYPE "public"."unit_type" AS ENUM('split', 'window', 'central', 'vrf', 'cassette', 'chiller');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('superadmin', 'administrator', 'manager', 'admin_staff', 'engineer');--> statement-breakpoint
CREATE TYPE "public"."visit_status" AS ENUM('scheduled', 'in_progress', 'completed', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TABLE "ac_units" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"type" "unit_type" NOT NULL,
	"btu" integer NOT NULL,
	"serial_number" text NOT NULL,
	"installed_at" timestamp with time zone NOT NULL,
	"location" text NOT NULL,
	"condition" "unit_condition" NOT NULL,
	"last_serviced_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"type" "customer_type" NOT NULL,
	"contact_person" text NOT NULL,
	"name" text NOT NULL,
	"company_name" text,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"country" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"owner_id" text,
	"notes" text DEFAULT '' NOT NULL,
	"lifetime_value" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_touched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"category" "expense_category" NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"spent_at" timestamp with time zone NOT NULL,
	"vendor" text,
	"recorded_by_id" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"number" text NOT NULL,
	"customer_id" text NOT NULL,
	"source" "income_source" NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"issued_at" timestamp with time zone NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"status" "invoice_status" NOT NULL,
	"method" "payment_method",
	"visit_id" text,
	"contract_id" text,
	"quotation_id" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"kind" "notification_kind" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"unread" boolean DEFAULT true NOT NULL,
	"href" text,
	"customer_id" text,
	"contract_id" text,
	"visit_id" text,
	"quotation_id" text,
	"invoice_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotation_lines" (
	"id" text PRIMARY KEY NOT NULL,
	"quotation_id" text NOT NULL,
	"position" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(12, 3) NOT NULL,
	"unit_price" numeric(14, 2) NOT NULL,
	"tax_pct" numeric(6, 2)
);
--> statement-breakpoint
CREATE TABLE "quotations" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"number" text NOT NULL,
	"customer_id" text NOT NULL,
	"category" "quotation_category" NOT NULL,
	"status" "quotation_status" NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"discount_pct" numeric(6, 2) DEFAULT '0' NOT NULL,
	"tax_pct" numeric(6, 2) DEFAULT '0' NOT NULL,
	"owner_id" text,
	"valid_until" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone,
	"decided_at" timestamp with time zone,
	"converted_to_contract_id" text,
	"converted_to_work_order_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_contract_units" (
	"contract_id" text NOT NULL,
	"unit_id" text NOT NULL,
	CONSTRAINT "service_contract_units_contract_id_unit_id_pk" PRIMARY KEY("contract_id","unit_id")
);
--> statement-breakpoint
CREATE TABLE "service_contracts" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"number" text NOT NULL,
	"customer_id" text NOT NULL,
	"type" "contract_type" NOT NULL,
	"status" "contract_status" NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"frequency" "service_frequency" NOT NULL,
	"custom_interval_days" integer,
	"engineer_id" text,
	"value" numeric(14, 2) NOT NULL,
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_visit_units" (
	"visit_id" text NOT NULL,
	"unit_id" text NOT NULL,
	CONSTRAINT "service_visit_units_visit_id_unit_id_pk" PRIMARY KEY("visit_id","unit_id")
);
--> statement-breakpoint
CREATE TABLE "service_visits" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"number" text NOT NULL,
	"customer_id" text NOT NULL,
	"engineer_id" text NOT NULL,
	"contract_id" text,
	"quotation_id" text,
	"type" "contract_type" NOT NULL,
	"status" "visit_status" NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"duration_minutes" integer,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"customer_signed" boolean DEFAULT false NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"checklist" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rating" double precision,
	"revenue" numeric(14, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"plan" "tenant_plan" NOT NULL,
	"status" "tenant_status" NOT NULL,
	"country" text NOT NULL,
	"industry" text NOT NULL,
	"owner_id" text,
	"trial_ends_at" timestamp with time zone,
	"notes" text,
	"storage_bytes_used" numeric(20, 0) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"role" "user_role" NOT NULL,
	"title" text NOT NULL,
	"skills" jsonb,
	"rating" double precision,
	"experience_years" integer,
	"hue" integer,
	"disabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ac_units" ADD CONSTRAINT "ac_units_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ac_units" ADD CONSTRAINT "ac_units_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recorded_by_id_users_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_visit_id_service_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."service_visits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contract_id_service_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."service_contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_contract_id_service_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."service_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_visit_id_service_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."service_visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_lines" ADD CONSTRAINT "quotation_lines_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_contract_units" ADD CONSTRAINT "service_contract_units_contract_id_service_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."service_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_contract_units" ADD CONSTRAINT "service_contract_units_unit_id_ac_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."ac_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_contracts" ADD CONSTRAINT "service_contracts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_contracts" ADD CONSTRAINT "service_contracts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_contracts" ADD CONSTRAINT "service_contracts_engineer_id_users_id_fk" FOREIGN KEY ("engineer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_visit_units" ADD CONSTRAINT "service_visit_units_visit_id_service_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."service_visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_visit_units" ADD CONSTRAINT "service_visit_units_unit_id_ac_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."ac_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_visits" ADD CONSTRAINT "service_visits_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_visits" ADD CONSTRAINT "service_visits_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_visits" ADD CONSTRAINT "service_visits_engineer_id_users_id_fk" FOREIGN KEY ("engineer_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_visits" ADD CONSTRAINT "service_visits_contract_id_service_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."service_contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_visits" ADD CONSTRAINT "service_visits_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ac_units_tenant_idx" ON "ac_units" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ac_units_customer_idx" ON "ac_units" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customers_tenant_idx" ON "customers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "customers_owner_idx" ON "customers" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "expenses_tenant_idx" ON "expenses" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "expenses_category_idx" ON "expenses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "expenses_spent_idx" ON "expenses" USING btree ("spent_at");--> statement-breakpoint
CREATE INDEX "invoices_tenant_idx" ON "invoices" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_number_idx" ON "invoices" USING btree ("tenant_id","number");--> statement-breakpoint
CREATE INDEX "invoices_customer_idx" ON "invoices" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoices_due_idx" ON "invoices" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "notifications_tenant_idx" ON "notifications" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "notifications_unread_idx" ON "notifications" USING btree ("unread");--> statement-breakpoint
CREATE INDEX "notifications_created_idx" ON "notifications" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "quotation_lines_quotation_idx" ON "quotation_lines" USING btree ("quotation_id");--> statement-breakpoint
CREATE INDEX "quotations_tenant_idx" ON "quotations" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quotations_number_idx" ON "quotations" USING btree ("tenant_id","number");--> statement-breakpoint
CREATE INDEX "quotations_customer_idx" ON "quotations" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "quotations_status_idx" ON "quotations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "service_contracts_tenant_idx" ON "service_contracts" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "service_contracts_number_idx" ON "service_contracts" USING btree ("tenant_id","number");--> statement-breakpoint
CREATE INDEX "service_contracts_customer_idx" ON "service_contracts" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "service_contracts_status_idx" ON "service_contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "service_visits_tenant_idx" ON "service_visits" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "service_visits_number_idx" ON "service_visits" USING btree ("tenant_id","number");--> statement-breakpoint
CREATE INDEX "service_visits_customer_idx" ON "service_visits" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "service_visits_engineer_idx" ON "service_visits" USING btree ("engineer_id");--> statement-breakpoint
CREATE INDEX "service_visits_status_idx" ON "service_visits" USING btree ("status");--> statement-breakpoint
CREATE INDEX "service_visits_scheduled_idx" ON "service_visits" USING btree ("scheduled_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_tenant_idx" ON "users" USING btree ("tenant_id");