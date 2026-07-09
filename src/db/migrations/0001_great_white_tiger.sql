ALTER TABLE "quotation_lines" ADD COLUMN "tenant_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "service_contract_units" ADD COLUMN "tenant_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "service_visit_units" ADD COLUMN "tenant_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "quotation_lines" ADD CONSTRAINT "quotation_lines_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_contract_units" ADD CONSTRAINT "service_contract_units_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_visit_units" ADD CONSTRAINT "service_visit_units_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quotation_lines_tenant_idx" ON "quotation_lines" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "service_contract_units_tenant_idx" ON "service_contract_units" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "service_visit_units_tenant_idx" ON "service_visit_units" USING btree ("tenant_id");