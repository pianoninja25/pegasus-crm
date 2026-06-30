/**
 * UI string catalogue for Pegasus AC Service.
 *
 * Keys are flat (dot-namespaced) so the {@link useT} hook can look them up in
 * O(1). The English copy is the source of truth — if a key is missing from
 * the Indonesian map at runtime, `useT` falls back to English.
 */

import type { Locale } from "./types";

export type DictKey =
  | "common.search"
  | "common.filters"
  | "common.clearFilters"
  | "common.new"
  | "common.of"
  | "common.table"
  | "common.map"
  | "common.actions"
  | "common.today"
  | "common.thisWeek"
  | "common.thisMonth"
  | "common.thisYear"
  | "common.upcoming"
  | "common.completed"
  | "common.scheduled"
  | "common.inProgress"
  | "common.overdue"
  | "common.cancelled"
  | "common.draft"
  | "common.sent"
  | "common.approved"
  | "common.rejected"
  | "common.expired"
  | "common.status"
  | "common.customer"
  | "common.customers"
  | "common.engineer"
  | "common.engineers"
  | "common.contract"
  | "common.contracts"
  | "common.quotation"
  | "common.quotations"
  | "common.visit"
  | "common.visits"
  | "common.invoice"
  | "common.invoices"
  | "common.expense"
  | "common.expenses"
  | "common.income"
  | "common.net"
  | "common.total"
  | "common.subtotal"
  | "common.discount"
  | "common.tax"
  | "common.amount"
  | "common.date"
  | "common.notes"
  | "common.profile"
  | "common.notifications"
  | "common.settings"
  | "common.viewAll"
  | "common.open"
  | "common.signIn"
  | "common.signOut"
  | "common.signedInAs"
  | "common.markAllRead"
  | "common.greeting.morning"
  | "common.greeting.afternoon"
  | "common.greeting.evening"
  | "nav.workspace"
  | "nav.operations"
  | "nav.finance"
  | "nav.account"
  | "nav.dashboard"
  | "nav.scheduling"
  | "nav.customers"
  | "nav.quotations"
  | "nav.contracts"
  | "nav.workOrders"
  | "nav.engineers"
  | "nav.invoices"
  | "nav.expenses"
  | "nav.reports"
  | "nav.myTasks"
  | "nav.notifications"
  | "nav.settings"
  | "dashboard.welcomeBack"
  | "dashboard.salesSummary"
  | "dashboard.serviceContracts"
  | "dashboard.upcomingVisits"
  | "dashboard.upcomingVisitsHint"
  | "dashboard.openScheduling"
  | "dashboard.renewalRadar"
  | "dashboard.renewalRadarHint"
  | "dashboard.engineerPerformance"
  | "dashboard.engineerPerformanceHint"
  | "dashboard.openRoster"
  | "dashboard.todaysSchedule"
  | "dashboard.newQuotation"
  | "dashboard.allClear"
  | "dashboard.alerts.overdue"
  | "dashboard.alerts.upcoming"
  | "dashboard.alerts.myTasksToday"
  | "stats.active"
  | "stats.expiringSoon"
  | "stats.awaitingRenewal"
  | "stats.unread"
  | "stats.outstanding"
  | "stats.collected"
  | "stats.profit"
  | "stats.acUnits"
  | "settings.title"
  | "settings.description"
  | "settings.language"
  | "settings.languageHint"
  | "settings.currency"
  | "settings.currencyHint"
  | "settings.appearance"
  | "settings.profile"
  | "settings.team"
  | "settings.billing"
  | "settings.editProfile"
  | "settings.glassEffects"
  | "settings.motion"
  | "customer.type.residential"
  | "customer.type.commercial"
  | "customer.type.industrial"
  | "customers.new"
  | "customers.searchPlaceholder"
  | "customers.empty"
  | "customers.column.type"
  | "customers.column.contact"
  | "customers.column.location"
  | "customers.column.units"
  | "customers.column.revenue"
  | "customers.column.lastContact"
  | "customers.filter.nameOrContact"
  | "customers.filter.phoneOrEmail"
  | "customers.insight.activeAccounts"
  | "customers.insight.newInLast30Suffix"
  | "customers.insight.noNew"
  | "customers.insight.onRecurring"
  | "customers.insight.accountsLower"
  | "customers.insight.totalRevenue"
  | "customers.insight.avg"
  | "customers.insight.perAccount"
  | "customers.insight.unitsServiced"
  | "customers.insight.avgPerAccount"
  | "customers.map.selectedPin"
  | "customers.map.preview"
  | "customers.map.tapAnother"
  | "customers.map.shownSuffix"
  | "customers.map.filtersApply"
  | "customers.map.clickAny"
  | "customers.map.openProfile"
  | "customers.search.noResults"
  | "customers.search.minChars"
  | "customers.create.title"
  | "customers.create.description"
  | "customers.create.name"
  | "customers.create.namePlaceholder"
  | "customers.create.company"
  | "customers.create.companyPlaceholder"
  | "customers.create.contactPerson"
  | "customers.create.contactPersonPlaceholder"
  | "customers.create.phone"
  | "customers.create.email"
  | "customers.create.address"
  | "customers.create.addressPlaceholder"
  | "customers.create.city"
  | "customers.create.country"
  | "customers.create.type"
  | "customers.create.lat"
  | "customers.create.lng"
  | "customers.create.notes"
  | "customers.create.notesPlaceholder"
  | "customers.create.submit"
  | "customers.create.submitting"
  | "customers.create.cancel"
  | "customers.create.sectionContact"
  | "customers.create.sectionLocation"
  | "customers.create.sectionDetails"
  | "customers.create.coordsHint"
  | "customers.create.requiredHint"
  | "customers.map.summary"
  | "customers.map.coverage"
  | "customers.map.cities"
  | "customers.map.countries"
  | "customers.map.unitsCovered"
  | "customers.map.mixByType"
  | "customers.map.topCities"
  | "customers.map.exploreHint"
  | "engineers.searchPlaceholder"
  | "engineers.empty"
  | "engineers.manageRoster"
  | "engineers.column.engineer"
  | "engineers.column.skills"
  | "engineers.column.experience"
  | "engineers.column.completed"
  | "engineers.column.scheduled"
  | "engineers.column.hours"
  | "engineers.column.rating"
  | "engineers.column.revenue"
  | "engineers.filter.nameOrTitle"
  | "engineers.filter.skills"
  | "engineers.insight.activeRoster"
  | "engineers.insight.activeRosterCaption"
  | "engineers.insight.jobsCompleted"
  | "engineers.insight.jobsCompletedCaption"
  | "engineers.insight.serviceHours"
  | "engineers.insight.serviceHoursCaption"
  | "engineers.insight.avgRating"
  | "engineers.insight.avgRatingCaption"
  | "engineers.years"
  | "engineers.experienceShort"
  | "engineers.new"
  | "engineers.create.title"
  | "engineers.create.description"
  | "engineers.create.sectionIdentity"
  | "engineers.create.sectionContact"
  | "engineers.create.sectionProfile"
  | "engineers.create.name"
  | "engineers.create.namePlaceholder"
  | "engineers.create.titleField"
  | "engineers.create.titlePlaceholder"
  | "engineers.create.email"
  | "engineers.create.phone"
  | "engineers.create.experience"
  | "engineers.create.skills"
  | "engineers.create.skillsHint"
  | "engineers.create.submit"
  | "engineers.create.submitting"
  | "engineers.create.cancel"
  | "engineers.create.requiredHint"
  | "engineers.detail.assignVisit"
  | "engineers.detail.profile"
  | "engineers.detail.skills"
  | "engineers.detail.experience"
  | "engineers.detail.upcoming"
  | "engineers.detail.upcomingHint"
  | "engineers.detail.noUpcoming"
  | "engineers.detail.completedTimeline"
  | "engineers.detail.completedTimelineHint"
  | "engineers.detail.noCompleted"
  | "engineers.detail.revenueMtd"
  | "engineers.detail.lastVisit"
  | "engineers.detail.lifetimeRevenue"
  | "engineers.detail.notFound"
  | "customers.stage.prospect"
  | "customers.stage.active"
  | "customers.stage.vip"
  | "customers.stage.dormant"
  | "customers.stage.title"
  | "customers.stage.allStages"
  | "customers.stage.prospectHint"
  | "customers.stage.column"
  | "customers.create.lifecycleHint"
  | "settings.company.title"
  | "settings.company.description"
  | "settings.company.sectionIdentity"
  | "settings.company.sectionBrand"
  | "settings.company.sectionBank"
  | "settings.company.sectionTerms"
  | "settings.company.sectionWhatsapp"
  | "settings.company.name"
  | "settings.company.tagline"
  | "settings.company.address"
  | "settings.company.cityRegion"
  | "settings.company.country"
  | "settings.company.phone"
  | "settings.company.email"
  | "settings.company.website"
  | "settings.company.npwp"
  | "settings.company.bankName"
  | "settings.company.bankAccountNumber"
  | "settings.company.bankAccountHolder"
  | "settings.company.signatoryName"
  | "settings.company.signatoryTitle"
  | "settings.company.logoLabel"
  | "settings.company.logoHint"
  | "settings.company.stampLabel"
  | "settings.company.stampHint"
  | "settings.company.signatureLabel"
  | "settings.company.signatureHint"
  | "settings.company.uploadCta"
  | "settings.company.removeImage"
  | "settings.company.defaultTerms"
  | "settings.company.defaultTermsHint"
  | "settings.company.whatsappTemplate"
  | "settings.company.whatsappTemplateHint"
  | "settings.company.whatsappPlaceholders"
  | "settings.company.savedHint"
  | "settings.company.reset"
  | "settings.company.resetConfirm"
  | "quotations.detail.shareWa"
  | "quotations.detail.shareWaInvalidPhone"
  | "quotations.detail.shareWaSent"
  | "quotations.detail.waDialog.title"
  | "quotations.detail.waDialog.lead"
  | "quotations.detail.waDialog.step1Title"
  | "quotations.detail.waDialog.step1Body"
  | "quotations.detail.waDialog.step2Title"
  | "quotations.detail.waDialog.step2Body"
  | "quotations.detail.waDialog.step3Title"
  | "quotations.detail.waDialog.step3Body"
  | "quotations.detail.waDialog.attachReason"
  | "quotations.detail.waDialog.dontShowAgain"
  | "quotations.detail.waDialog.cancel"
  | "quotations.detail.waDialog.confirm"
  | "quotations.detail.waDialog.pdfReady"
  | "quotations.detail.waDialog.pdfReadyHint"
  | "quotations.detail.waDialog.openWa"
  | "quotations.detail.waDialog.preview"
  | "quotations.detail.printed.docTitle"
  | "quotations.detail.printed.billTo"
  | "quotations.detail.printed.no"
  | "quotations.detail.printed.date"
  | "quotations.detail.printed.validUntil"
  | "quotations.detail.printed.description"
  | "quotations.detail.printed.qty"
  | "quotations.detail.printed.unitPrice"
  | "quotations.detail.printed.lineTotal"
  | "quotations.detail.printed.subtotal"
  | "quotations.detail.printed.discount"
  | "quotations.detail.printed.tax"
  | "quotations.detail.printed.total"
  | "quotations.detail.printed.paymentTo"
  | "quotations.detail.printed.terms"
  | "quotations.detail.printed.regards"
  | "quotations.title"
  | "quotations.description"
  | "quotations.new"
  | "quotations.searchPlaceholder"
  | "quotations.empty"
  | "quotations.insight.openCount"
  | "quotations.insight.openCountCaption"
  | "quotations.insight.pipeline"
  | "quotations.insight.pipelineCaption"
  | "quotations.insight.winRate"
  | "quotations.insight.winRateCaption"
  | "quotations.insight.expiringSoon"
  | "quotations.insight.expiringSoonCaption"
  | "quotations.column.quotation"
  | "quotations.column.customer"
  | "quotations.column.category"
  | "quotations.column.status"
  | "quotations.column.total"
  | "quotations.column.validUntil"
  | "quotations.column.owner"
  | "quotations.filter.allCategories"
  | "quotations.filter.allStatuses"
  | "quotations.filter.titleOrNumber"
  | "quotations.status.draft"
  | "quotations.status.sent"
  | "quotations.status.approved"
  | "quotations.status.rejected"
  | "quotations.status.expired"
  | "quotations.category.service"
  | "quotations.category.product"
  | "quotations.category.spare_parts"
  | "quotations.category.service_contract"
  | "quotations.create.title"
  | "quotations.create.description"
  | "quotations.create.sectionDetails"
  | "quotations.create.sectionLines"
  | "quotations.create.sectionTotals"
  | "quotations.create.titleField"
  | "quotations.create.titlePlaceholder"
  | "quotations.create.category"
  | "quotations.create.customer"
  | "quotations.create.customerPlaceholder"
  | "quotations.create.customerNoMatch"
  | "quotations.create.customerCreateNew"
  | "quotations.create.customerCreateAsHint"
  | "quotations.create.validUntil"
  | "quotations.create.notes"
  | "quotations.create.notesPlaceholder"
  | "quotations.create.lineDescription"
  | "quotations.create.lineDescriptionPlaceholder"
  | "quotations.create.lineQty"
  | "quotations.create.lineUnitPrice"
  | "quotations.create.lineTotal"
  | "quotations.create.addLine"
  | "quotations.create.removeLine"
  | "quotations.create.discountPct"
  | "quotations.create.taxPct"
  | "quotations.create.subtotal"
  | "quotations.create.discountAmount"
  | "quotations.create.taxAmount"
  | "quotations.create.total"
  | "quotations.create.submit"
  | "quotations.create.submitting"
  | "quotations.create.cancel"
  | "quotations.create.requiredHint"
  | "quotations.detail.notFound"
  | "quotations.detail.subtotal"
  | "quotations.detail.discount"
  | "quotations.detail.tax"
  | "quotations.detail.total"
  | "quotations.detail.validUntil"
  | "quotations.detail.validityRemaining"
  | "quotations.detail.expired"
  | "quotations.detail.lineItems"
  | "quotations.detail.lineCount"
  | "quotations.detail.notes"
  | "quotations.detail.history"
  | "quotations.detail.drafted"
  | "quotations.detail.sentToCustomer"
  | "quotations.detail.send"
  | "quotations.detail.markApproved"
  | "quotations.detail.markRejected"
  | "quotations.detail.downloadPdf"
  | "quotations.detail.nextStep"
  | "quotations.detail.nextStepHint"
  | "quotations.detail.convertWorkOrder"
  | "quotations.detail.convertContract"
  | "quotations.detail.convertInvoice"
  | "quotations.detail.customer"
  | "quotations.detail.owner"
  | "contracts.title"
  | "contracts.description"
  | "contracts.new"
  | "contracts.searchPlaceholder"
  | "contracts.empty"
  | "contracts.insight.active"
  | "contracts.insight.activeCaption"
  | "contracts.insight.recurringValue"
  | "contracts.insight.recurringValueCaption"
  | "contracts.insight.expiringSoon"
  | "contracts.insight.expiringSoonCaption"
  | "contracts.insight.awaitingRenewal"
  | "contracts.insight.awaitingRenewalCaption"
  | "contracts.column.contract"
  | "contracts.column.customer"
  | "contracts.column.type"
  | "contracts.column.frequency"
  | "contracts.column.status"
  | "contracts.column.engineer"
  | "contracts.column.coverage"
  | "contracts.column.value"
  | "contracts.filter.numberOrCustomer"
  | "contracts.status.draft"
  | "contracts.status.active"
  | "contracts.status.expiring_soon"
  | "contracts.status.awaiting_renewal"
  | "contracts.status.completed"
  | "contracts.type.ac_cleaning"
  | "contracts.type.ac_replacement"
  | "contracts.type.spare_part_replacement"
  | "contracts.type.preventive_maintenance"
  | "contracts.type.custom"
  | "contracts.frequency.monthly"
  | "contracts.frequency.quarterly"
  | "contracts.frequency.biannual"
  | "contracts.frequency.annual"
  | "contracts.frequency.custom"
  | "contracts.create.title"
  | "contracts.create.description"
  | "contracts.create.sectionParties"
  | "contracts.create.sectionTerms"
  | "contracts.create.sectionCoverage"
  | "contracts.create.customer"
  | "contracts.create.customerPlaceholder"
  | "contracts.create.customerNoMatch"
  | "contracts.create.customerCreateNew"
  | "contracts.create.engineer"
  | "contracts.create.engineerPlaceholder"
  | "contracts.create.engineerLead"
  | "contracts.create.type"
  | "contracts.create.frequency"
  | "contracts.create.customIntervalDays"
  | "contracts.create.startDate"
  | "contracts.create.endDate"
  | "contracts.create.duration"
  | "contracts.create.value"
  | "contracts.create.valueHint"
  | "contracts.create.notes"
  | "contracts.create.notesPlaceholder"
  | "contracts.create.units"
  | "contracts.create.unitsHint"
  | "contracts.create.unitsNone"
  | "contracts.create.submit"
  | "contracts.create.submitting"
  | "contracts.create.cancel"
  | "contracts.create.requiredHint"
  | "contracts.create.previewSchedule"
  | "contracts.create.previewScheduleHint"
  | "contracts.detail.notFound"
  | "contracts.detail.contractValue"
  | "contracts.detail.workOrdersCompleted"
  | "contracts.detail.workOrdersTotal"
  | "contracts.detail.nextWorkOrder"
  | "contracts.detail.workOrderSchedule"
  | "contracts.detail.workOrderScheduleHint"
  | "contracts.detail.noWorkOrders"
  | "contracts.detail.coverage"
  | "contracts.detail.terms"
  | "contracts.detail.units"
  | "contracts.detail.unitsHint"
  | "contracts.detail.scheduleNext"
  | "contracts.detail.markCompleted"
  | "contracts.detail.markRenewed"
  | "contracts.detail.markActivated"
  // ───────── Work orders (list page) ─────────
  | "workOrders.title"
  | "workOrders.description"
  | "workOrders.new"
  | "workOrders.searchPlaceholder"
  | "workOrders.empty"
  | "workOrders.insight.scheduled"
  | "workOrders.insight.scheduledCaption"
  | "workOrders.insight.inProgress"
  | "workOrders.insight.inProgressCaption"
  | "workOrders.insight.completed"
  | "workOrders.insight.completedCaption"
  | "workOrders.insight.overdue"
  | "workOrders.insight.overdueCaption"
  | "workOrders.column.workOrder"
  | "workOrders.column.customer"
  | "workOrders.column.type"
  | "workOrders.column.engineer"
  | "workOrders.column.status"
  | "workOrders.column.scheduled"
  | "workOrders.column.duration"
  | "workOrders.column.revenue"
  | "workOrders.filter.numberOrCustomer"
  | "workOrders.status.scheduled"
  | "workOrders.status.in_progress"
  | "workOrders.status.completed"
  | "workOrders.status.overdue"
  | "workOrders.status.cancelled"
  | "workOrders.duration.notLogged"
  | "workOrders.source.contract"
  | "workOrders.source.quotation"
  | "workOrders.source.adhoc"
  // ───────── Scheduling ─────────
  | "scheduling.title"
  | "scheduling.description"
  | "scheduling.new"
  | "scheduling.book"
  | "scheduling.searchPlaceholder"
  | "scheduling.insight.today"
  | "scheduling.insight.todayCaption"
  | "scheduling.insight.thisWeek"
  | "scheduling.insight.thisWeekCaption"
  | "scheduling.insight.inProgress"
  | "scheduling.insight.inProgressCaption"
  | "scheduling.insight.attention"
  | "scheduling.insight.attentionCaption"
  | "scheduling.insight.attentionAllClear"
  | "scheduling.delta.vsYesterday"
  | "scheduling.delta.vsLastWeek"
  | "scheduling.footer.completed"
  | "scheduling.footer.inProgress"
  | "scheduling.footer.remaining"
  | "scheduling.footer.coverage"
  | "scheduling.footer.busiest"
  | "scheduling.footer.avgDuration"
  | "scheduling.footer.longest"
  | "scheduling.footer.overdue"
  | "scheduling.footer.unassigned"
  | "scheduling.calendar.tapDay"
  | "scheduling.filter.engineer"
  | "scheduling.day.empty"
  | "scheduling.day.stopsOne"
  | "scheduling.day.stopsMany"
  | "scheduling.day.engineerOne"
  | "scheduling.day.engineerMany"
  | "scheduling.workload.title"
  | "scheduling.workload.hint"
  | "scheduling.workload.empty"
  | "scheduling.workload.stopsOne"
  | "scheduling.workload.stopsMany"
  | "scheduling.workload.overdue"
  | "scheduling.workload.completed"
  | "scheduling.workload.filteringHint"
  | "scheduling.workload.idle"
  | "scheduling.workload.now"
  | "scheduling.workload.teamStops"
  | "scheduling.workload.fullyBooked"
  | "scheduling.metric.today"
  | "scheduling.metric.week"
  | "scheduling.metric.active"
  | "scheduling.metric.risk"
  | "scheduling.day.next"
  | "scheduling.day.dayCapacity"
  // ───────── Work orders (detail page) ─────────
  | "workOrders.detail.notFound"
  | "workOrders.detail.loading"
  | "workOrders.detail.start"
  | "workOrders.detail.markComplete"
  | "workOrders.detail.completeChecklistFirst"
  | "workOrders.detail.signedBadge"
  | "workOrders.detail.checklistRemaining"
  | "workOrders.detail.checklistAllDone"
  | "workOrders.detail.ratingNone"
  | "workOrders.detail.ratingReviewed"
  | "workOrders.detail.revenueLogged"
  | "workOrders.detail.revenueUnbilled"
  | "workOrders.detail.rail.customer"
  | "workOrders.detail.rail.engineer"
  | "workOrders.detail.rail.contact"
  | "workOrders.detail.rail.location"
  | "workOrders.detail.rail.notes"
  | "workOrders.detail.rail.linked"
  | "workOrders.detail.rail.linkedContract"
  | "workOrders.detail.rail.linkedQuotation"
  | "workOrders.detail.tab.checklist"
  | "workOrders.detail.tab.units"
  | "workOrders.detail.tab.documentation"
  | "workOrders.detail.tab.timeline"
  | "workOrders.detail.checklist.hint"
  | "workOrders.detail.checklist.empty"
  | "workOrders.detail.units.empty"
  | "workOrders.detail.docs.hint"
  | "workOrders.detail.docs.uploadPhoto"
  | "workOrders.detail.docs.signatureLabel"
  | "workOrders.detail.docs.signatureCaptured"
  | "workOrders.detail.docs.signatureMissing"
  | "workOrders.detail.docs.captureSignature"
  | "workOrders.detail.timeline.scheduled"
  | "workOrders.detail.timeline.started"
  | "workOrders.detail.timeline.completed"
  | "workOrders.detail.timeline.now"
  // ───────── My Tasks (engineer landing) ─────────
  | "myTasks.subtitle"
  | "myTasks.openCalendar"
  | "myTasks.insight.today"
  | "myTasks.insight.todayCaption"
  | "myTasks.insight.upcoming"
  | "myTasks.insight.upcomingCaption"
  | "myTasks.insight.completed"
  | "myTasks.insight.completedCaption"
  | "myTasks.insight.rating"
  | "myTasks.insight.ratingCaption"
  | "myTasks.insight.ratingNone"
  | "myTasks.today.title"
  | "myTasks.today.empty"
  | "myTasks.today.stopsOne"
  | "myTasks.today.stopsMany"
  | "myTasks.upcoming.title"
  | "myTasks.upcoming.hint"
  | "myTasks.upcoming.empty"
  // ───────── Finance · Income & Expenses overview ─────────
  | "finance.column.invoice"
  | "finance.column.customer"
  | "finance.column.source"
  | "finance.column.issued"
  | "finance.column.due"
  | "finance.column.status"
  | "finance.column.method"
  | "finance.column.amount"
  // ───────── Finance · enhanced overview ─────────
  | "finance.allTime"
  // ───────── Finance · Invoices list ─────────
  | "invoices.title"
  | "invoices.description"
  | "invoices.new"
  | "invoices.searchPlaceholder"
  | "invoices.empty"
  | "invoices.insight.totalBilled"
  | "invoices.insight.totalBilledCaption"
  | "invoices.insight.collected"
  | "invoices.insight.collectedCaption"
  | "invoices.insight.outstanding"
  | "invoices.insight.outstandingCaption"
  | "invoices.insight.overdue"
  | "invoices.insight.overdueCaption"
  | "invoices.filter.numberOrCustomer"
  | "invoices.status.draft"
  | "invoices.status.sent"
  | "invoices.status.paid"
  | "invoices.status.partially_paid"
  | "invoices.status.overdue"
  | "invoices.status.cancelled"
  | "invoices.source.service_job"
  | "invoices.source.product_sale"
  | "invoices.source.spare_part_sale"
  | "invoices.source.service_contract"
  | "invoices.method.cash"
  | "invoices.method.bank_transfer"
  | "invoices.method.credit_card"
  | "invoices.method.ewallet"
  | "invoices.method.check"
  | "invoices.method.unpaid"
  // ───────── Finance · New invoice ─────────
  | "invoices.new.title"
  | "invoices.new.description"
  | "invoices.new.section.parties"
  | "invoices.new.section.terms"
  | "invoices.new.section.line"
  | "invoices.new.field.customer"
  | "invoices.new.field.source"
  | "invoices.new.field.amount"
  | "invoices.new.field.issuedAt"
  | "invoices.new.field.dueAt"
  | "invoices.new.field.method"
  | "invoices.new.field.notes"
  | "invoices.new.cta"
  | "invoices.new.demoNote"
  | "invoices.new.backToInvoices"
  // ───────── Finance · Invoices date-range filter ─────────
  | "invoices.dateRange.label"
  | "invoices.dateRange.clear"
  | "invoices.dateRange.toLabel"
  // ───────── Finance · Expenses list ─────────
  | "expenses.title"
  | "expenses.description"
  | "expenses.searchPlaceholder"
  | "expenses.empty"
  | "expenses.recordEntry"
  | "expenses.filter.descriptionOrVendor"
  | "expenses.insight.totalSpend"
  | "expenses.insight.totalSpendCaption"
  | "expenses.insight.biggestCategory"
  | "expenses.insight.biggestCategoryCaption"
  | "expenses.insight.entries"
  | "expenses.insight.entriesCaption"
  | "expenses.insight.biggestVendor"
  | "expenses.insight.biggestVendorCaption"
  | "expenses.column.description"
  | "expenses.column.category"
  | "expenses.column.vendor"
  | "expenses.column.recordedBy"
  | "expenses.column.date"
  | "expenses.column.amount"
  // ───────── Finance · overview row filter chips ─────────
  // ───────── Expenses meta ─────────
  | "expenses.category.fuel"
  | "expenses.category.transport"
  | "expenses.category.spare_parts"
  | "expenses.category.tools"
  | "expenses.category.salaries"
  | "expenses.category.rent"
  | "expenses.category.utilities"
  | "expenses.category.marketing"
  | "expenses.category.misc"
  // ───────── Reports ─────────
  | "reports.title"
  | "reports.description"
  | "reports.insight.income6mo"
  | "reports.insight.income6moCaption"
  | "reports.insight.expenses6mo"
  | "reports.insight.expenses6moCaption"
  | "reports.insight.profit6mo"
  | "reports.insight.profit6moCaption"
  | "reports.insight.winRate"
  | "reports.insight.winRateCaption"
  | "reports.pnl.title"
  | "reports.pnl.description"
  | "reports.topCustomers.title"
  | "reports.topCustomers.description"
  | "reports.engineerLeaderboard.title"
  | "reports.engineerLeaderboard.description"
  | "reports.frequentServices.title"
  | "reports.frequentServices.description"
  | "reports.expensesByCategory.title"
  | "reports.expensesByCategory.description"
  | "reports.contractHealth.title"
  | "reports.contractHealth.description"
  | "reports.engineer.jobsSuffix";

export type Dictionary = Record<DictKey, string>;

const en: Dictionary = {
  "common.search": "Search",
  "common.filters": "Filters",
  "common.clearFilters": "Clear filters",
  "common.new": "New",
  "common.of": "of",
  "common.table": "Table",
  "common.map": "Map",
  "common.actions": "Actions",
  "common.today": "Today",
  "common.thisWeek": "This week",
  "common.thisMonth": "This month",
  "common.thisYear": "This year",
  "common.upcoming": "Upcoming",
  "common.completed": "Completed",
  "common.scheduled": "Scheduled",
  "common.inProgress": "In progress",
  "common.overdue": "Overdue",
  "common.cancelled": "Cancelled",
  "common.draft": "Draft",
  "common.sent": "Sent",
  "common.approved": "Approved",
  "common.rejected": "Rejected",
  "common.expired": "Expired",
  "common.status": "Status",
  "common.customer": "Customer",
  "common.customers": "Customers",
  "common.engineer": "Engineer",
  "common.engineers": "Engineers",
  "common.contract": "Contract",
  "common.contracts": "Contracts",
  "common.quotation": "Quotation",
  "common.quotations": "Quotations",
  "common.visit": "Work order",
  "common.visits": "Work orders",
  "common.invoice": "Invoice",
  "common.invoices": "Invoices",
  "common.expense": "Expense",
  "common.expenses": "Expenses",
  "common.income": "Income",
  "common.net": "Net",
  "common.total": "Total",
  "common.subtotal": "Subtotal",
  "common.discount": "Discount",
  "common.tax": "Tax",
  "common.amount": "Amount",
  "common.date": "Date",
  "common.notes": "Notes",
  "common.profile": "Profile",
  "common.notifications": "Notifications",
  "common.settings": "Settings",
  "common.viewAll": "View all",
  "common.open": "Open",
  "common.signIn": "Sign in",
  "common.signOut": "Sign out",
  "common.signedInAs": "Signed in as",
  "common.markAllRead": "Mark all read",
  "common.greeting.morning": "Good morning",
  "common.greeting.afternoon": "Good afternoon",
  "common.greeting.evening": "Good evening",
  "nav.workspace": "Workspace",
  "nav.operations": "Operations",
  "nav.finance": "Finance",
  "nav.account": "Account",
  "nav.dashboard": "Dashboard",
  "nav.scheduling": "Scheduling",
  "nav.customers": "Customers",
  "nav.quotations": "Quotations",
  "nav.contracts": "Service Contracts",
  "nav.workOrders": "Work Orders",
  "nav.engineers": "Engineers",
  "nav.invoices": "Invoices",
  "nav.expenses": "Expenses",
  "nav.reports": "Reports",
  "nav.myTasks": "My Tasks",
  "nav.notifications": "Notifications",
  "nav.settings": "Settings",
  "dashboard.welcomeBack": "Welcome back",
  "dashboard.salesSummary": "Sales summary",
  "dashboard.serviceContracts": "Service contracts",
  "dashboard.upcomingVisits": "Upcoming work orders",
  "dashboard.upcomingVisitsHint": "Scheduled jobs across the team",
  "dashboard.openScheduling": "Open scheduling",
  "dashboard.renewalRadar": "Renewal radar",
  "dashboard.renewalRadarHint": "Contracts to chase this month",
  "dashboard.engineerPerformance": "Engineer performance",
  "dashboard.engineerPerformanceHint":
    "This month · jobs, hours, revenue and customer rating",
  "dashboard.openRoster": "Open roster",
  "dashboard.todaysSchedule": "Today's schedule",
  "dashboard.newQuotation": "New quotation",
  "dashboard.allClear": "All clear",
  "dashboard.alerts.overdue": "Overdue maintenance",
  "dashboard.alerts.upcoming": "Upcoming this week",
  "dashboard.alerts.myTasksToday": "My tasks today",
  "stats.active": "Active",
  "stats.expiringSoon": "Expiring soon",
  "stats.awaitingRenewal": "Awaiting renewal",
  "stats.unread": "Unread",
  "stats.outstanding": "Outstanding",
  "stats.collected": "Collected",
  "stats.profit": "Profit",
  "stats.acUnits": "AC Units",
  "settings.title": "Settings",
  "settings.description": "Manage your workspace, theme, billing and team.",
  "settings.language": "Language",
  "settings.languageHint":
    "Switches the entire workspace chrome between English and Bahasa Indonesia.",
  "settings.currency": "Currency",
  "settings.currencyHint":
    "Reformats every monetary value across the app. Demo rates are converted from a USD base.",
  "settings.appearance": "Appearance",
  "settings.profile": "Profile",
  "settings.team": "Team",
  "settings.billing": "Billing",
  "settings.editProfile": "Edit profile",
  "settings.glassEffects": "Glass effects",
  "settings.motion": "Motion animations",
  "customer.type.residential": "Residential",
  "customer.type.commercial": "Commercial",
  "customer.type.industrial": "Industrial",
  "customers.new": "New customer",
  "customers.searchPlaceholder": "Search customers, contacts…",
  "customers.empty": "No customers match those filters.",
  "customers.column.type": "Type",
  "customers.column.contact": "Contact",
  "customers.column.location": "Location",
  "customers.column.units": "Units",
  "customers.column.revenue": "Revenue",
  "customers.column.lastContact": "Last contact",
  "customers.filter.nameOrContact": "Search name or contact…",
  "customers.filter.phoneOrEmail": "Phone or email…",
  "customers.insight.activeAccounts": "Active accounts",
  "customers.insight.newInLast30Suffix": "new in the last 30 days",
  "customers.insight.noNew": "No new accounts in the last 30 days",
  "customers.insight.onRecurring": "On recurring contract",
  "customers.insight.accountsLower": "accounts",
  "customers.insight.totalRevenue": "Total revenue",
  "customers.insight.avg": "Avg",
  "customers.insight.perAccount": "per account",
  "customers.insight.unitsServiced": "AC units serviced",
  "customers.insight.avgPerAccount": "avg per account",
  "customers.map.selectedPin": "Selected pin",
  "customers.map.preview": "Map preview",
  "customers.map.tapAnother": "Tap another pin to switch customers.",
  "customers.map.shownSuffix": "customers shown on the map",
  "customers.map.filtersApply": "filters from the table apply",
  "customers.map.clickAny": "Click any pin on the map to inspect a customer.",
  "customers.map.openProfile": "Open profile",
  "customers.search.noResults": "No customers match that search.",
  "customers.search.minChars": "Type at least 2 characters to search.",
  "customers.create.title": "Add a new customer",
  "customers.create.description":
    "Register a customer account. You'll be able to attach AC units, contracts and quotations from their profile after.",
  "customers.create.name": "Customer name",
  "customers.create.namePlaceholder": "e.g. PT Aneka Sejuk",
  "customers.create.company": "Company (optional)",
  "customers.create.companyPlaceholder": "Legal entity, if different",
  "customers.create.contactPerson": "Contact person",
  "customers.create.contactPersonPlaceholder": "Primary contact's full name",
  "customers.create.phone": "Phone",
  "customers.create.email": "Email",
  "customers.create.address": "Address",
  "customers.create.addressPlaceholder": "Street, building, unit",
  "customers.create.city": "City",
  "customers.create.country": "Country",
  "customers.create.type": "Customer type",
  "customers.create.lat": "Latitude",
  "customers.create.lng": "Longitude",
  "customers.create.notes": "Notes",
  "customers.create.notesPlaceholder":
    "Anything the field team should know — site access, preferred contact hours, etc.",
  "customers.create.submit": "Create customer",
  "customers.create.submitting": "Creating…",
  "customers.create.cancel": "Cancel",
  "customers.create.sectionContact": "Contact",
  "customers.create.sectionLocation": "Location",
  "customers.create.sectionDetails": "Details",
  "customers.create.coordsHint":
    "We'll pin the customer on the service map at the city centre. You can fine-tune the pin location later from the customer profile.",
  "customers.create.requiredHint": "Fields marked with * are required.",
  "customers.map.summary": "Map summary",
  "customers.map.coverage": "Coverage",
  "customers.map.cities": "cities",
  "customers.map.countries": "countries",
  "customers.map.unitsCovered": "AC units",
  "customers.map.mixByType": "Customer mix",
  "customers.map.topCities": "Top cities",
  "customers.map.exploreHint":
    "Tap a cluster to zoom in, or a pin to inspect a customer.",
  "engineers.searchPlaceholder": "Search engineers, skills…",
  "engineers.empty": "No engineers match those filters.",
  "engineers.manageRoster": "Manage roster",
  "engineers.column.engineer": "Engineer",
  "engineers.column.skills": "Skills",
  "engineers.column.experience": "Experience",
  "engineers.column.completed": "Completed",
  "engineers.column.scheduled": "Scheduled",
  "engineers.column.hours": "Hours",
  "engineers.column.rating": "Rating",
  "engineers.column.revenue": "Revenue",
  "engineers.filter.nameOrTitle": "Name or title…",
  "engineers.filter.skills": "Filter by skill…",
  "engineers.insight.activeRoster": "Active roster",
  "engineers.insight.activeRosterCaption": "field engineers on payroll",
  "engineers.insight.jobsCompleted": "Jobs completed",
  "engineers.insight.jobsCompletedCaption": "this month · across the team",
  "engineers.insight.serviceHours": "Service hours",
  "engineers.insight.serviceHoursCaption": "billable hours logged this month",
  "engineers.insight.avgRating": "Avg customer rating",
  "engineers.insight.avgRatingCaption": "across completed jobs this month",
  "engineers.years": "years",
  "engineers.experienceShort": "y exp.",
  "engineers.new": "New engineer",
  "engineers.create.title": "Add a new engineer",
  "engineers.create.description":
    "Onboard a field engineer to the roster. You can assign work orders and contracts after creation.",
  "engineers.create.sectionIdentity": "Identity",
  "engineers.create.sectionContact": "Contact",
  "engineers.create.sectionProfile": "Profile",
  "engineers.create.name": "Full name",
  "engineers.create.namePlaceholder": "e.g. Budi Wijaya",
  "engineers.create.titleField": "Job title",
  "engineers.create.titlePlaceholder": "e.g. Field Engineer",
  "engineers.create.email": "Email",
  "engineers.create.phone": "Phone",
  "engineers.create.experience": "Years of experience",
  "engineers.create.skills": "Skills",
  "engineers.create.skillsHint": "Tap a chip to toggle. Add custom skills later from the profile.",
  "engineers.create.submit": "Create engineer",
  "engineers.create.submitting": "Creating…",
  "engineers.create.cancel": "Cancel",
  "engineers.create.requiredHint": "Fields marked with * are required.",
  "engineers.detail.assignVisit": "Assign new work order",
  "engineers.detail.profile": "Profile",
  "engineers.detail.skills": "Skills",
  "engineers.detail.experience": "Experience",
  "engineers.detail.upcoming": "Upcoming jobs",
  "engineers.detail.upcomingHint": "Work orders scheduled or in progress.",
  "engineers.detail.noUpcoming": "No upcoming work orders booked.",
  "engineers.detail.completedTimeline": "Recent activity",
  "engineers.detail.completedTimelineHint":
    "Last service jobs completed by this engineer.",
  "engineers.detail.noCompleted": "No completed work orders yet.",
  "engineers.detail.revenueMtd": "Revenue MTD",
  "engineers.detail.lastVisit": "Last work order",
  "engineers.detail.lifetimeRevenue": "lifetime",
  "engineers.detail.notFound": "Engineer not found.",
  "customers.stage.prospect": "Prospect",
  "customers.stage.active": "Active",
  "customers.stage.vip": "VIP",
  "customers.stage.dormant": "Dormant",
  "customers.stage.title": "Stage",
  "customers.stage.allStages": "All stages",
  "customers.stage.prospectHint":
    "In the pipeline · not yet transacted with us.",
  "customers.stage.column": "Stage",
  "customers.create.lifecycleHint":
    "New customers start as Prospect. They auto-promote to Active when their first quotation is approved or an invoice is paid.",
  "settings.company.title": "Company & Brand",
  "settings.company.description":
    "Branding printed on every quotation, invoice and work order. Logo, stamp and bank info come from here.",
  "settings.company.sectionIdentity": "Identity",
  "settings.company.sectionBrand": "Brand assets",
  "settings.company.sectionBank": "Bank details",
  "settings.company.sectionTerms": "Defaults",
  "settings.company.sectionWhatsapp": "WhatsApp template",
  "settings.company.name": "Company name",
  "settings.company.tagline": "Tagline",
  "settings.company.address": "Address",
  "settings.company.cityRegion": "City, region & postcode",
  "settings.company.country": "Country",
  "settings.company.phone": "Phone",
  "settings.company.email": "Email",
  "settings.company.website": "Website",
  "settings.company.npwp": "NPWP / Tax ID",
  "settings.company.bankName": "Bank",
  "settings.company.bankAccountNumber": "Account number",
  "settings.company.bankAccountHolder": "Account holder",
  "settings.company.signatoryName": "Signatory name",
  "settings.company.signatoryTitle": "Signatory title",
  "settings.company.logoLabel": "Logo",
  "settings.company.logoHint": "Square PNG/JPG. Transparent background recommended.",
  "settings.company.stampLabel": "Stamp",
  "settings.company.stampHint":
    "Transparent PNG. Printed beside the signatory.",
  "settings.company.signatureLabel": "Signature",
  "settings.company.signatureHint":
    "Optional. Transparent PNG of your signature.",
  "settings.company.uploadCta": "Upload",
  "settings.company.removeImage": "Remove",
  "settings.company.defaultTerms": "Default terms & conditions",
  "settings.company.defaultTermsHint":
    "Printed on every quotation under the totals block.",
  "settings.company.whatsappTemplate": "WhatsApp message template",
  "settings.company.whatsappTemplateHint":
    "Used when sharing a quotation via WhatsApp.",
  "settings.company.whatsappPlaceholders":
    "Placeholders: {{customer.name}}, {{customer.contact}}, {{quotation.number}}, {{quotation.title}}, {{quotation.total}}, {{quotation.validUntil}}, {{company.name}}, {{signatory.name}}.",
  "settings.company.savedHint": "Saved automatically — visible everywhere.",
  "settings.company.reset": "Reset to defaults",
  "settings.company.resetConfirm":
    "Reset all company & brand fields back to the original defaults?",
  "quotations.detail.shareWa": "Send via WhatsApp",
  "quotations.detail.shareWaInvalidPhone":
    "Customer has no valid phone number — share via WhatsApp unavailable.",
  "quotations.detail.shareWaSent": "Shared via WhatsApp",
  "quotations.detail.waDialog.title": "Send this quotation via WhatsApp",
  "quotations.detail.waDialog.lead":
    "WhatsApp doesn't let websites attach files automatically. Here's the 3-step flow we'll run for you:",
  "quotations.detail.waDialog.step1Title": "Download the branded PDF",
  "quotations.detail.waDialog.step1Body":
    "We'll save a PDF with your logo, stamp, bank info and totals to your Downloads folder.",
  "quotations.detail.waDialog.step2Title": "Open WhatsApp with message ready",
  "quotations.detail.waDialog.step2Body":
    "WhatsApp opens at the customer's chat with your template already typed.",
  "quotations.detail.waDialog.step3Title": "Attach the PDF — one tap",
  "quotations.detail.waDialog.step3Body":
    "In WhatsApp, tap the paperclip and pick the PDF we just downloaded, then hit send.",
  "quotations.detail.waDialog.attachReason":
    "Why isn't the file attached automatically? — WhatsApp blocks websites from pushing attachments without you confirming. This is the universal flow used by every CRM that integrates without the paid Business API.",
  "quotations.detail.waDialog.dontShowAgain": "Got it — don't show this again",
  "quotations.detail.waDialog.cancel": "Cancel",
  "quotations.detail.waDialog.confirm": "Download PDF & open WhatsApp",
  "quotations.detail.waDialog.pdfReady": "PDF downloaded",
  "quotations.detail.waDialog.pdfReadyHint":
    "Check your Downloads folder, then attach it in the WhatsApp tab.",
  "quotations.detail.waDialog.openWa": "Open WhatsApp chat",
  "quotations.detail.waDialog.preview": "Message preview",
  "quotations.detail.printed.docTitle": "QUOTATION",
  "quotations.detail.printed.billTo": "Bill to",
  "quotations.detail.printed.no": "No.",
  "quotations.detail.printed.date": "Date",
  "quotations.detail.printed.validUntil": "Valid until",
  "quotations.detail.printed.description": "Description",
  "quotations.detail.printed.qty": "Qty",
  "quotations.detail.printed.unitPrice": "Unit price",
  "quotations.detail.printed.lineTotal": "Line total",
  "quotations.detail.printed.subtotal": "Subtotal",
  "quotations.detail.printed.discount": "Discount",
  "quotations.detail.printed.tax": "Tax",
  "quotations.detail.printed.total": "Total",
  "quotations.detail.printed.paymentTo": "Payment to",
  "quotations.detail.printed.terms": "Terms & conditions",
  "quotations.detail.printed.regards": "Best regards,",
  "quotations.title": "Quotations",
  "quotations.description":
    "Draft, send and track quotations through approval. Approved quotations convert into work orders or service contracts.",
  "quotations.new": "New quotation",
  "quotations.searchPlaceholder": "Search number, title or customer…",
  "quotations.empty": "No quotations match these filters.",
  "quotations.insight.openCount": "Open quotations",
  "quotations.insight.openCountCaption": "drafts + sent · awaiting decision",
  "quotations.insight.pipeline": "Pipeline value",
  "quotations.insight.pipelineCaption": "sent · open to close",
  "quotations.insight.winRate": "Win rate",
  "quotations.insight.winRateCaption": "approved ÷ decided",
  "quotations.insight.expiringSoon": "Expiring this week",
  "quotations.insight.expiringSoonCaption": "sent · valid ≤ 7 days",
  "quotations.column.quotation": "Quotation",
  "quotations.column.customer": "Customer",
  "quotations.column.category": "Category",
  "quotations.column.status": "Status",
  "quotations.column.total": "Total",
  "quotations.column.validUntil": "Valid until",
  "quotations.column.owner": "Owner",
  "quotations.filter.allCategories": "All categories",
  "quotations.filter.allStatuses": "All statuses",
  "quotations.filter.titleOrNumber": "Filter by title or number",
  "quotations.status.draft": "Draft",
  "quotations.status.sent": "Sent",
  "quotations.status.approved": "Approved",
  "quotations.status.rejected": "Rejected",
  "quotations.status.expired": "Expired",
  "quotations.category.service": "Service",
  "quotations.category.product": "Product",
  "quotations.category.spare_parts": "Spare Parts",
  "quotations.category.service_contract": "Service Contract",
  "quotations.create.title": "Draft a new quotation",
  "quotations.create.description":
    "Build the offer line by line. It starts as a draft — sending is a separate step on the detail page.",
  "quotations.create.sectionDetails": "Details",
  "quotations.create.sectionLines": "Line items",
  "quotations.create.sectionTotals": "Totals",
  "quotations.create.titleField": "Title",
  "quotations.create.titlePlaceholder": "e.g. Annual maintenance contract",
  "quotations.create.category": "Category",
  "quotations.create.customer": "Customer",
  "quotations.create.customerPlaceholder": "Type to search customers…",
  "quotations.create.customerNoMatch": "No customers match.",
  "quotations.create.customerCreateNew": "Create new customer",
  "quotations.create.customerCreateAsHint": "Opens the customer form prefilled.",
  "quotations.create.validUntil": "Valid until",
  "quotations.create.notes": "Notes",
  "quotations.create.notesPlaceholder": "Terms, scope of work, exclusions…",
  "quotations.create.lineDescription": "Description",
  "quotations.create.lineDescriptionPlaceholder": "Service or item",
  "quotations.create.lineQty": "Qty",
  "quotations.create.lineUnitPrice": "Unit price",
  "quotations.create.lineTotal": "Total",
  "quotations.create.addLine": "Add line",
  "quotations.create.removeLine": "Remove line",
  "quotations.create.discountPct": "Discount %",
  "quotations.create.taxPct": "Tax %",
  "quotations.create.subtotal": "Subtotal",
  "quotations.create.discountAmount": "Discount",
  "quotations.create.taxAmount": "Tax",
  "quotations.create.total": "Total",
  "quotations.create.submit": "Save draft",
  "quotations.create.submitting": "Saving…",
  "quotations.create.cancel": "Cancel",
  "quotations.create.requiredHint":
    "Fields marked with * are required. New quotations start as drafts.",
  "quotations.detail.notFound": "Quotation not found.",
  "quotations.detail.subtotal": "Subtotal",
  "quotations.detail.discount": "Discount",
  "quotations.detail.tax": "Tax",
  "quotations.detail.total": "Total",
  "quotations.detail.validUntil": "Valid until",
  "quotations.detail.validityRemaining": "remaining",
  "quotations.detail.expired": "expired",
  "quotations.detail.lineItems": "Line items",
  "quotations.detail.lineCount": "items",
  "quotations.detail.notes": "Notes",
  "quotations.detail.history": "History",
  "quotations.detail.drafted": "Drafted",
  "quotations.detail.sentToCustomer": "Sent to customer",
  "quotations.detail.send": "Send to customer",
  "quotations.detail.markApproved": "Mark approved",
  "quotations.detail.markRejected": "Mark rejected",
  "quotations.detail.downloadPdf": "Download PDF",
  "quotations.detail.nextStep": "Next step",
  "quotations.detail.nextStepHint":
    "Convert this approved quotation into the right entity.",
  "quotations.detail.convertWorkOrder": "Create work order",
  "quotations.detail.convertContract": "Open service contract",
  "quotations.detail.convertInvoice": "Generate invoice",
  "quotations.detail.customer": "Customer",
  "quotations.detail.owner": "Owner",
  "contracts.title": "Service contracts",
  "contracts.description":
    "Recurring maintenance agreements. Each active contract auto-generates scheduled work orders based on its frequency.",
  "contracts.new": "New contract",
  "contracts.searchPlaceholder": "Search contract, customer, engineer…",
  "contracts.empty": "No contracts match those filters.",
  "contracts.insight.active": "Active contracts",
  "contracts.insight.activeCaption": "Currently generating work orders",
  "contracts.insight.recurringValue": "Recurring value",
  "contracts.insight.recurringValueCaption": "Across active + expiring",
  "contracts.insight.expiringSoon": "Expiring soon",
  "contracts.insight.expiringSoonCaption": "Renew within 30 days",
  "contracts.insight.awaitingRenewal": "Awaiting renewal",
  "contracts.insight.awaitingRenewalCaption": "Past end-date, not closed",
  "contracts.column.contract": "Contract",
  "contracts.column.customer": "Customer",
  "contracts.column.type": "Type",
  "contracts.column.frequency": "Frequency",
  "contracts.column.status": "Status",
  "contracts.column.engineer": "Lead engineer",
  "contracts.column.coverage": "Coverage",
  "contracts.column.value": "Value",
  "contracts.filter.numberOrCustomer": "Contract number or customer",
  "contracts.status.draft": "Draft",
  "contracts.status.active": "Active",
  "contracts.status.expiring_soon": "Expiring soon",
  "contracts.status.awaiting_renewal": "Awaiting renewal",
  "contracts.status.completed": "Completed",
  "contracts.type.ac_cleaning": "AC Cleaning",
  "contracts.type.ac_replacement": "AC Replacement",
  "contracts.type.spare_part_replacement": "Spare Part Replacement",
  "contracts.type.preventive_maintenance": "Preventive Maintenance",
  "contracts.type.custom": "Custom Package",
  "contracts.frequency.monthly": "Monthly",
  "contracts.frequency.quarterly": "Quarterly",
  "contracts.frequency.biannual": "Every 6 months",
  "contracts.frequency.annual": "Annual",
  "contracts.frequency.custom": "Custom interval",
  "contracts.create.title": "New service contract",
  "contracts.create.description":
    "Lock in a recurring maintenance relationship. Pegasus will generate scheduled work orders from the start date based on the chosen frequency.",
  "contracts.create.sectionParties": "Parties",
  "contracts.create.sectionTerms": "Terms & scope",
  "contracts.create.sectionCoverage": "Coverage",
  "contracts.create.customer": "Customer",
  "contracts.create.customerPlaceholder":
    "Search customer by name or company…",
  "contracts.create.customerNoMatch": "No customer matches.",
  "contracts.create.customerCreateNew": "Create new customer",
  "contracts.create.engineer": "Lead engineer",
  "contracts.create.engineerPlaceholder": "Assign primary engineer…",
  "contracts.create.engineerLead":
    "Primary engineer on every recurring work order. Can be reassigned per visit.",
  "contracts.create.type": "Contract type",
  "contracts.create.frequency": "Service frequency",
  "contracts.create.customIntervalDays": "Custom interval (days)",
  "contracts.create.startDate": "Start date",
  "contracts.create.endDate": "End date",
  "contracts.create.duration": "Duration",
  "contracts.create.value": "Contract value",
  "contracts.create.valueHint":
    "Total annual or contract value (used for forecasting recurring revenue).",
  "contracts.create.notes": "Scope & special terms",
  "contracts.create.notesPlaceholder":
    "Inclusions, exclusions, customer obligations, billing schedule…",
  "contracts.create.units": "AC units covered",
  "contracts.create.unitsHint":
    "Pick the customer's AC units this contract covers. Leave empty to cover all current and future units.",
  "contracts.create.unitsNone": "This customer has no registered AC units yet.",
  "contracts.create.submit": "Create contract",
  "contracts.create.submitting": "Creating…",
  "contracts.create.cancel": "Cancel",
  "contracts.create.requiredHint": "Customer, type, frequency, dates, engineer, value are required.",
  "contracts.create.previewSchedule": "Schedule preview",
  "contracts.create.previewScheduleHint":
    "First 4 work-order dates that Pegasus will auto-create.",
  "contracts.detail.notFound": "Contract not found.",
  "contracts.detail.contractValue": "Contract value",
  "contracts.detail.workOrdersCompleted": "Work orders completed",
  "contracts.detail.workOrdersTotal": "Across the contract lifetime",
  "contracts.detail.nextWorkOrder": "Next work order",
  "contracts.detail.workOrderSchedule": "Work order schedule",
  "contracts.detail.workOrderScheduleHint":
    "Every visit generated from this contract. Click to open the work order.",
  "contracts.detail.noWorkOrders":
    "No work orders generated yet. Activate the contract to start the schedule.",
  "contracts.detail.coverage": "Coverage",
  "contracts.detail.terms": "Scope & terms",
  "contracts.detail.units": "AC units covered",
  "contracts.detail.unitsHint":
    "Empty list means the contract covers every AC unit owned by the customer.",
  "contracts.detail.scheduleNext": "Schedule next work order",
  "contracts.detail.markCompleted": "Mark completed",
  "contracts.detail.markRenewed": "Mark renewed",
  "contracts.detail.markActivated": "Activate contract",
  // ───────── Work orders (list page) ─────────
  "workOrders.title": "Work orders",
  "workOrders.description":
    "Every work order across the team — recurring contract jobs and one-off assignments.",
  "workOrders.new": "New work order",
  "workOrders.searchPlaceholder": "Search number, customer, engineer…",
  "workOrders.empty": "No work orders match those filters.",
  "workOrders.insight.scheduled": "Scheduled",
  "workOrders.insight.scheduledCaption": "Upcoming on the calendar",
  "workOrders.insight.inProgress": "In progress",
  "workOrders.insight.inProgressCaption": "Engineers on-site right now",
  "workOrders.insight.completed": "Completed",
  "workOrders.insight.completedCaption": "Closed-out & signed",
  "workOrders.insight.overdue": "Overdue",
  "workOrders.insight.overdueCaption": "Past scheduled time without start",
  "workOrders.column.workOrder": "Work order",
  "workOrders.column.customer": "Customer",
  "workOrders.column.type": "Type",
  "workOrders.column.engineer": "Engineer",
  "workOrders.column.status": "Status",
  "workOrders.column.scheduled": "Scheduled",
  "workOrders.column.duration": "Duration",
  "workOrders.column.revenue": "Revenue",
  "workOrders.filter.numberOrCustomer": "Number or customer",
  "workOrders.status.scheduled": "Scheduled",
  "workOrders.status.in_progress": "In progress",
  "workOrders.status.completed": "Completed",
  "workOrders.status.overdue": "Overdue",
  "workOrders.status.cancelled": "Cancelled",
  "workOrders.duration.notLogged": "Not logged",
  "workOrders.source.contract": "Contract",
  "workOrders.source.quotation": "Quotation",
  "workOrders.source.adhoc": "Ad-hoc",
  // ───────── Scheduling ─────────
  "scheduling.title": "Service scheduling",
  "scheduling.description":
    "Calendar view of every work order — see today’s load, drill into a day and spot engineers who need backup.",
  "scheduling.new": "New work order",
  "scheduling.book": "Book",
  "scheduling.searchPlaceholder": "Search number, customer, engineer…",
  "scheduling.insight.today": "Today",
  "scheduling.insight.todayCaption": "Work orders booked today",
  "scheduling.insight.thisWeek": "This week",
  "scheduling.insight.thisWeekCaption": "Sun–Sat across all engineers",
  "scheduling.insight.inProgress": "In progress now",
  "scheduling.insight.inProgressCaption": "No engineers on-site right now",
  "scheduling.insight.attention": "Needs attention",
  "scheduling.insight.attentionCaption": "Overdue + unassigned",
  "scheduling.insight.attentionAllClear": "Schedule looks clean",
  "scheduling.delta.vsYesterday": "vs yesterday",
  "scheduling.delta.vsLastWeek": "vs last week",
  "scheduling.footer.completed": "Done",
  "scheduling.footer.inProgress": "Active",
  "scheduling.footer.remaining": "Remaining",
  "scheduling.footer.coverage": "Assigned",
  "scheduling.footer.busiest": "Busiest day",
  "scheduling.footer.avgDuration": "Avg duration",
  "scheduling.footer.longest": "Longest run",
  "scheduling.footer.overdue": "Overdue",
  "scheduling.footer.unassigned": "Unassigned",
  "scheduling.calendar.tapDay": "Tap any day to see scheduled work",
  "scheduling.filter.engineer": "Engineer",
  "scheduling.day.empty": "Nothing scheduled for this day.",
  "scheduling.day.stopsOne": "stop",
  "scheduling.day.stopsMany": "stops",
  "scheduling.day.engineerOne": "engineer",
  "scheduling.day.engineerMany": "engineers",
  "scheduling.workload.title": "Engineer workload",
  "scheduling.workload.hint": "Stops booked this week per engineer. Click a card to filter.",
  "scheduling.workload.empty": "No engineers have visits booked this week.",
  "scheduling.workload.stopsOne": "stop",
  "scheduling.workload.stopsMany": "stops",
  "scheduling.workload.overdue": "overdue",
  "scheduling.workload.completed": "done",
  "scheduling.workload.filteringHint": "Filtering by",
  "scheduling.workload.idle": "idle",
  "scheduling.workload.now": "now",
  "scheduling.workload.teamStops": "team stops this week",
  "scheduling.workload.fullyBooked": "team fully booked",
  "scheduling.metric.today": "Today",
  "scheduling.metric.week": "Week",
  "scheduling.metric.active": "Active",
  "scheduling.metric.risk": "Risk",
  "scheduling.day.next": "Next",
  "scheduling.day.dayCapacity": "Day capacity ≈ 8 stops",
  // ───────── Work orders (detail page) ─────────
  "workOrders.detail.notFound": "Work order not found.",
  "workOrders.detail.loading": "Loading…",
  "workOrders.detail.start": "Start service",
  "workOrders.detail.markComplete": "Mark complete",
  "workOrders.detail.completeChecklistFirst": "Complete checklist first",
  "workOrders.detail.signedBadge": "Signed",
  "workOrders.detail.checklistRemaining": "to verify",
  "workOrders.detail.checklistAllDone": "All clear",
  "workOrders.detail.ratingNone": "Not rated yet",
  "workOrders.detail.ratingReviewed": "Customer reviewed",
  "workOrders.detail.revenueLogged": "Logged this visit",
  "workOrders.detail.revenueUnbilled": "Awaiting closeout",
  "workOrders.detail.rail.customer": "Customer",
  "workOrders.detail.rail.engineer": "Engineer",
  "workOrders.detail.rail.contact": "Contact",
  "workOrders.detail.rail.location": "Location",
  "workOrders.detail.rail.notes": "Engineer notes",
  "workOrders.detail.rail.linked": "Linked",
  "workOrders.detail.rail.linkedContract": "Service contract",
  "workOrders.detail.rail.linkedQuotation": "Quotation",
  "workOrders.detail.tab.checklist": "Checklist",
  "workOrders.detail.tab.units": "Units",
  "workOrders.detail.tab.documentation": "Documentation",
  "workOrders.detail.tab.timeline": "Timeline",
  "workOrders.detail.checklist.hint":
    "All items must be checked before closing this work order.",
  "workOrders.detail.checklist.empty": "No checklist items for this visit.",
  "workOrders.detail.units.empty": "No specific units linked to this visit.",
  "workOrders.detail.docs.hint": "Before / after photos and customer signature.",
  "workOrders.detail.docs.uploadPhoto": "Upload photo",
  "workOrders.detail.docs.signatureLabel": "Customer signature",
  "workOrders.detail.docs.signatureCaptured": "Captured by",
  "workOrders.detail.docs.signatureMissing": "Not yet collected",
  "workOrders.detail.docs.captureSignature": "Capture signature",
  "workOrders.detail.timeline.scheduled": "Scheduled",
  "workOrders.detail.timeline.started": "Started",
  "workOrders.detail.timeline.completed": "Completed & signed off",
  "workOrders.detail.timeline.now": "Now",
  // ───────── My Tasks (engineer landing) ─────────
  "myTasks.subtitle": "Here's everything on your plate today and this week.",
  "myTasks.openCalendar": "Open calendar",
  "myTasks.insight.today": "Today",
  "myTasks.insight.todayCaption": "Stops scheduled for today",
  "myTasks.insight.upcoming": "Upcoming",
  "myTasks.insight.upcomingCaption": "Coming up after today",
  "myTasks.insight.completed": "Completed (7d)",
  "myTasks.insight.completedCaption": "Wrapped this week",
  "myTasks.insight.rating": "Your rating",
  "myTasks.insight.ratingCaption": "Avg. customer score",
  "myTasks.insight.ratingNone": "No rating yet",
  "myTasks.today.title": "Today",
  "myTasks.today.empty": "No tasks assigned today. Enjoy the coffee.",
  "myTasks.today.stopsOne": "stop",
  "myTasks.today.stopsMany": "stops",
  "myTasks.upcoming.title": "Coming up",
  "myTasks.upcoming.hint": "Your next scheduled work orders",
  "myTasks.upcoming.empty": "Your schedule is clear after today.",
  // ───────── Finance · shared (column headers + filters) ─────────
  "finance.column.invoice": "Invoice",
  "finance.column.customer": "Customer",
  "finance.column.source": "Source",
  "finance.column.issued": "Issued",
  "finance.column.due": "Due",
  "finance.column.status": "Status",
  "finance.column.method": "Method",
  "finance.column.amount": "Amount",
  "finance.allTime": "All time",
  // ───────── Finance · Invoices list ─────────
  "invoices.title": "Invoices",
  "invoices.description":
    "Every invoice issued — paid, outstanding and overdue. Bookkeeping happens here.",
  "invoices.new": "New invoice",
  "invoices.searchPlaceholder": "Search number, customer, source…",
  "invoices.empty": "No invoices match those filters.",
  "invoices.insight.totalBilled": "Total billed",
  "invoices.insight.totalBilledCaption": "Across the full ledger",
  "invoices.insight.collected": "Collected",
  "invoices.insight.collectedCaption": "Payments received",
  "invoices.insight.outstanding": "Outstanding",
  "invoices.insight.outstandingCaption": "Awaiting customer payment",
  "invoices.insight.overdue": "Overdue",
  "invoices.insight.overdueCaption": "Past due date",
  "invoices.filter.numberOrCustomer": "Number or customer",
  "invoices.status.draft": "Draft",
  "invoices.status.sent": "Sent",
  "invoices.status.paid": "Paid",
  "invoices.status.partially_paid": "Partially paid",
  "invoices.status.overdue": "Overdue",
  "invoices.status.cancelled": "Cancelled",
  "invoices.source.service_job": "Service job",
  "invoices.source.product_sale": "Product sale",
  "invoices.source.spare_part_sale": "Spare-part sale",
  "invoices.source.service_contract": "Service contract",
  "invoices.method.cash": "Cash",
  "invoices.method.bank_transfer": "Bank transfer",
  "invoices.method.credit_card": "Credit card",
  "invoices.method.ewallet": "E-wallet",
  "invoices.method.check": "Check",
  "invoices.method.unpaid": "—",
  // ───────── Finance · New invoice ─────────
  "invoices.new.title": "Record invoice",
  "invoices.new.description":
    "Issue an invoice for a one-off service, a product or spare-part sale, or a contract milestone.",
  "invoices.new.section.parties": "Parties",
  "invoices.new.section.terms": "Terms",
  "invoices.new.section.line": "Line item",
  "invoices.new.field.customer": "Customer",
  "invoices.new.field.source": "Source",
  "invoices.new.field.amount": "Amount",
  "invoices.new.field.issuedAt": "Issue date",
  "invoices.new.field.dueAt": "Due date",
  "invoices.new.field.method": "Expected payment method",
  "invoices.new.field.notes": "Notes (optional)",
  "invoices.new.cta": "Save invoice",
  "invoices.new.demoNote":
    "Demo only — wire this form to a mutation to persist real invoices.",
  "invoices.new.backToInvoices": "Back to invoices",
  // ───────── Finance · Invoices date-range filter ─────────
  "invoices.dateRange.label": "Date range",
  "invoices.dateRange.clear": "Clear",
  "invoices.dateRange.toLabel": "to",
  // ───────── Finance · Expenses list ─────────
  "expenses.title": "Expenses",
  "expenses.description":
    "Every operational spend — fuel, salaries, spare parts, tools and overhead. Cash going out.",
  "expenses.searchPlaceholder": "Search description, vendor, category…",
  "expenses.empty": "No expenses match those filters.",
  "expenses.recordEntry": "Record expense",
  "expenses.filter.descriptionOrVendor": "Description or vendor",
  "expenses.insight.totalSpend": "Total spend",
  "expenses.insight.totalSpendCaption": "Across the full ledger",
  "expenses.insight.biggestCategory": "Top category",
  "expenses.insight.biggestCategoryCaption": "Largest line of spend",
  "expenses.insight.entries": "Entries",
  "expenses.insight.entriesCaption": "Total expense records",
  "expenses.insight.biggestVendor": "Top vendor",
  "expenses.insight.biggestVendorCaption": "Largest single supplier",
  "expenses.column.description": "Description",
  "expenses.column.category": "Category",
  "expenses.column.vendor": "Vendor",
  "expenses.column.recordedBy": "Recorded by",
  "expenses.column.date": "Date",
  "expenses.column.amount": "Amount",
  // ───────── Expenses meta ─────────
  "expenses.category.fuel": "Fuel",
  "expenses.category.transport": "Transportation",
  "expenses.category.spare_parts": "Spare parts",
  "expenses.category.tools": "Tools",
  "expenses.category.salaries": "Salaries",
  "expenses.category.rent": "Rent",
  "expenses.category.utilities": "Utilities",
  "expenses.category.marketing": "Marketing",
  "expenses.category.misc": "Miscellaneous",
  // ───────── Reports ─────────
  "reports.title": "Reports",
  "reports.description":
    "Sales, engineer performance, contracts, top customers, P&L and more.",
  "reports.insight.income6mo": "Income (6mo)",
  "reports.insight.income6moCaption": "Trailing six months",
  "reports.insight.expenses6mo": "Expenses (6mo)",
  "reports.insight.expenses6moCaption": "Trailing six months",
  "reports.insight.profit6mo": "Profit (6mo)",
  "reports.insight.profit6moCaption": "Net of income minus expenses",
  "reports.insight.winRate": "Quotation win-rate",
  "reports.insight.winRateCaption": "Approved out of total",
  "reports.pnl.title": "Profit & Loss",
  "reports.pnl.description": "Last 6 months — income, expense, net.",
  "reports.topCustomers.title": "Top customers",
  "reports.topCustomers.description": "By lifetime revenue collected.",
  "reports.engineerLeaderboard.title": "Engineer leaderboard",
  "reports.engineerLeaderboard.description":
    "Year-to-date completed jobs + revenue.",
  "reports.frequentServices.title": "Most frequent services",
  "reports.frequentServices.description":
    "Completed work orders by service type.",
  "reports.expensesByCategory.title": "Expenses by category",
  "reports.expensesByCategory.description": "Where the money goes.",
  "reports.contractHealth.title": "Contract health",
  "reports.contractHealth.description":
    "Status distribution across all contracts.",
  "reports.engineer.jobsSuffix": "jobs",
};

const id: Dictionary = {
  "common.search": "Cari",
  "common.filters": "Filter",
  "common.clearFilters": "Hapus filter",
  "common.new": "Baru",
  "common.of": "dari",
  "common.table": "Tabel",
  "common.map": "Peta",
  "common.actions": "Aksi",
  "common.today": "Hari ini",
  "common.thisWeek": "Minggu ini",
  "common.thisMonth": "Bulan ini",
  "common.thisYear": "Tahun ini",
  "common.upcoming": "Akan datang",
  "common.completed": "Selesai",
  "common.scheduled": "Terjadwal",
  "common.inProgress": "Dikerjakan",
  "common.overdue": "Terlambat",
  "common.cancelled": "Dibatalkan",
  "common.draft": "Draf",
  "common.sent": "Terkirim",
  "common.approved": "Disetujui",
  "common.rejected": "Ditolak",
  "common.expired": "Kedaluwarsa",
  "common.status": "Status",
  "common.customer": "Pelanggan",
  "common.customers": "Pelanggan",
  "common.engineer": "Teknisi",
  "common.engineers": "Teknisi",
  "common.contract": "Kontrak",
  "common.contracts": "Kontrak Servis",
  "common.quotation": "Penawaran",
  "common.quotations": "Penawaran",
  "common.visit": "Perintah Kerja",
  "common.visits": "Perintah Kerja",
  "common.invoice": "Faktur",
  "common.invoices": "Faktur",
  "common.expense": "Pengeluaran",
  "common.expenses": "Pengeluaran",
  "common.income": "Pemasukan",
  "common.net": "Bersih",
  "common.total": "Total",
  "common.subtotal": "Subtotal",
  "common.discount": "Diskon",
  "common.tax": "Pajak",
  "common.amount": "Jumlah",
  "common.date": "Tanggal",
  "common.notes": "Catatan",
  "common.profile": "Profil",
  "common.notifications": "Notifikasi",
  "common.settings": "Pengaturan",
  "common.viewAll": "Lihat semua",
  "common.open": "Buka",
  "common.signIn": "Masuk",
  "common.signOut": "Keluar",
  "common.signedInAs": "Masuk sebagai",
  "common.markAllRead": "Tandai semua dibaca",
  "common.greeting.morning": "Selamat pagi",
  "common.greeting.afternoon": "Selamat siang",
  "common.greeting.evening": "Selamat malam",
  "nav.workspace": "Ruang Kerja",
  "nav.operations": "Operasional",
  "nav.finance": "Keuangan",
  "nav.account": "Akun",
  "nav.dashboard": "Dasbor",
  "nav.scheduling": "Jadwal Servis",
  "nav.customers": "Pelanggan",
  "nav.quotations": "Penawaran",
  "nav.contracts": "Kontrak Servis",
  "nav.workOrders": "Perintah Kerja",
  "nav.engineers": "Teknisi",
  "nav.invoices": "Faktur",
  "nav.expenses": "Pengeluaran",
  "nav.reports": "Laporan",
  "nav.myTasks": "Tugas Saya",
  "nav.notifications": "Notifikasi",
  "nav.settings": "Pengaturan",
  "dashboard.welcomeBack": "Selamat datang kembali",
  "dashboard.salesSummary": "Ringkasan penjualan",
  "dashboard.serviceContracts": "Kontrak servis",
  "dashboard.upcomingVisits": "Perintah kerja mendatang",
  "dashboard.upcomingVisitsHint": "Pekerjaan terjadwal seluruh tim",
  "dashboard.openScheduling": "Buka jadwal",
  "dashboard.renewalRadar": "Radar perpanjangan",
  "dashboard.renewalRadarHint": "Kontrak yang perlu diperpanjang bulan ini",
  "dashboard.engineerPerformance": "Performa teknisi",
  "dashboard.engineerPerformanceHint":
    "Bulan ini · pekerjaan, jam, pendapatan & rating",
  "dashboard.openRoster": "Buka daftar teknisi",
  "dashboard.todaysSchedule": "Jadwal hari ini",
  "dashboard.newQuotation": "Penawaran baru",
  "dashboard.allClear": "Semua aman",
  "dashboard.alerts.overdue": "Pemeliharaan terlambat",
  "dashboard.alerts.upcoming": "Akan datang minggu ini",
  "dashboard.alerts.myTasksToday": "Tugas saya hari ini",
  "stats.active": "Aktif",
  "stats.expiringSoon": "Segera berakhir",
  "stats.awaitingRenewal": "Menunggu perpanjangan",
  "stats.unread": "Belum dibaca",
  "stats.outstanding": "Tertunggak",
  "stats.collected": "Diterima",
  "stats.profit": "Laba",
  "stats.acUnits": "Unit AC",
  "settings.title": "Pengaturan",
  "settings.description":
    "Kelola ruang kerja, tema, tagihan, dan tim Anda.",
  "settings.language": "Bahasa",
  "settings.languageHint":
    "Ganti seluruh antarmuka antara Bahasa Inggris dan Bahasa Indonesia.",
  "settings.currency": "Mata Uang",
  "settings.currencyHint":
    "Mengubah format nilai uang di seluruh aplikasi. Nilai demo dikonversi dari basis USD.",
  "settings.appearance": "Tampilan",
  "settings.profile": "Profil",
  "settings.team": "Tim",
  "settings.billing": "Tagihan",
  "settings.editProfile": "Ubah profil",
  "settings.glassEffects": "Efek kaca",
  "settings.motion": "Animasi gerak",
  "customer.type.residential": "Residensial",
  "customer.type.commercial": "Komersial",
  "customer.type.industrial": "Industri",
  "customers.new": "Pelanggan baru",
  "customers.searchPlaceholder": "Cari pelanggan, kontak…",
  "customers.empty": "Tidak ada pelanggan yang sesuai filter.",
  "customers.column.type": "Tipe",
  "customers.column.contact": "Kontak",
  "customers.column.location": "Lokasi",
  "customers.column.units": "Unit",
  "customers.column.revenue": "Pendapatan",
  "customers.column.lastContact": "Kontak terakhir",
  "customers.filter.nameOrContact": "Cari nama atau kontak…",
  "customers.filter.phoneOrEmail": "Telepon atau email…",
  "customers.insight.activeAccounts": "Akun aktif",
  "customers.insight.newInLast30Suffix": "akun baru dalam 30 hari terakhir",
  "customers.insight.noNew": "Tidak ada akun baru dalam 30 hari terakhir",
  "customers.insight.onRecurring": "Kontrak berulang aktif",
  "customers.insight.accountsLower": "akun",
  "customers.insight.totalRevenue": "Total pendapatan",
  "customers.insight.avg": "Rata-rata",
  "customers.insight.perAccount": "per akun",
  "customers.insight.unitsServiced": "Unit AC dilayani",
  "customers.insight.avgPerAccount": "rata-rata per akun",
  "customers.map.selectedPin": "Pin terpilih",
  "customers.map.preview": "Pratinjau peta",
  "customers.map.tapAnother": "Ketuk pin lain untuk berganti pelanggan.",
  "customers.map.shownSuffix": "pelanggan ditampilkan di peta",
  "customers.map.filtersApply": "filter dari tabel diterapkan",
  "customers.map.clickAny": "Klik pin pada peta untuk melihat pelanggan.",
  "customers.map.openProfile": "Buka profil",
  "customers.search.noResults": "Tidak ada pelanggan yang sesuai.",
  "customers.search.minChars": "Ketik minimal 2 karakter untuk mencari.",
  "customers.create.title": "Tambah pelanggan baru",
  "customers.create.description":
    "Daftarkan akun pelanggan. Setelah itu Anda bisa menambahkan unit AC, kontrak, dan penawaran dari profilnya.",
  "customers.create.name": "Nama pelanggan",
  "customers.create.namePlaceholder": "mis. PT Aneka Sejuk",
  "customers.create.company": "Perusahaan (opsional)",
  "customers.create.companyPlaceholder": "Badan hukum, jika berbeda",
  "customers.create.contactPerson": "Narahubung",
  "customers.create.contactPersonPlaceholder": "Nama lengkap kontak utama",
  "customers.create.phone": "Telepon",
  "customers.create.email": "Email",
  "customers.create.address": "Alamat",
  "customers.create.addressPlaceholder": "Jalan, gedung, unit",
  "customers.create.city": "Kota",
  "customers.create.country": "Negara",
  "customers.create.type": "Tipe pelanggan",
  "customers.create.lat": "Lintang",
  "customers.create.lng": "Bujur",
  "customers.create.notes": "Catatan",
  "customers.create.notesPlaceholder":
    "Hal-hal yang perlu diketahui tim lapangan — akses lokasi, jam kontak, dll.",
  "customers.create.submit": "Buat pelanggan",
  "customers.create.submitting": "Menyimpan…",
  "customers.create.cancel": "Batal",
  "customers.create.sectionContact": "Kontak",
  "customers.create.sectionLocation": "Lokasi",
  "customers.create.sectionDetails": "Detail",
  "customers.create.coordsHint":
    "Pin akan ditempatkan di pusat kota pada peta servis. Anda bisa menyesuaikan lokasi pin nanti dari profil pelanggan.",
  "customers.create.requiredHint": "Kolom bertanda * wajib diisi.",
  "customers.map.summary": "Ringkasan peta",
  "customers.map.coverage": "Cakupan",
  "customers.map.cities": "kota",
  "customers.map.countries": "negara",
  "customers.map.unitsCovered": "unit AC",
  "customers.map.mixByType": "Komposisi pelanggan",
  "customers.map.topCities": "Kota teratas",
  "customers.map.exploreHint":
    "Ketuk cluster untuk memperbesar, atau pin untuk melihat detail pelanggan.",
  "engineers.searchPlaceholder": "Cari teknisi, keahlian…",
  "engineers.empty": "Tidak ada teknisi yang sesuai filter.",
  "engineers.manageRoster": "Kelola tim",
  "engineers.column.engineer": "Teknisi",
  "engineers.column.skills": "Keahlian",
  "engineers.column.experience": "Pengalaman",
  "engineers.column.completed": "Selesai",
  "engineers.column.scheduled": "Terjadwal",
  "engineers.column.hours": "Jam",
  "engineers.column.rating": "Rating",
  "engineers.column.revenue": "Pendapatan",
  "engineers.filter.nameOrTitle": "Nama atau jabatan…",
  "engineers.filter.skills": "Filter keahlian…",
  "engineers.insight.activeRoster": "Tim aktif",
  "engineers.insight.activeRosterCaption": "teknisi lapangan",
  "engineers.insight.jobsCompleted": "Pekerjaan selesai",
  "engineers.insight.jobsCompletedCaption": "bulan ini · seluruh tim",
  "engineers.insight.serviceHours": "Jam servis",
  "engineers.insight.serviceHoursCaption": "jam tercatat bulan ini",
  "engineers.insight.avgRating": "Rating rata-rata",
  "engineers.insight.avgRatingCaption": "dari pekerjaan selesai bulan ini",
  "engineers.years": "tahun",
  "engineers.experienceShort": "th",
  "engineers.new": "Teknisi baru",
  "engineers.create.title": "Tambah teknisi baru",
  "engineers.create.description":
    "Daftarkan teknisi lapangan ke dalam roster. Penugasan kunjungan dan kontrak bisa dilakukan setelahnya.",
  "engineers.create.sectionIdentity": "Identitas",
  "engineers.create.sectionContact": "Kontak",
  "engineers.create.sectionProfile": "Profil",
  "engineers.create.name": "Nama lengkap",
  "engineers.create.namePlaceholder": "contoh: Budi Wijaya",
  "engineers.create.titleField": "Jabatan",
  "engineers.create.titlePlaceholder": "contoh: Teknisi Lapangan",
  "engineers.create.email": "Email",
  "engineers.create.phone": "Telepon",
  "engineers.create.experience": "Pengalaman (tahun)",
  "engineers.create.skills": "Keahlian",
  "engineers.create.skillsHint":
    "Klik chip untuk memilih. Keahlian khusus bisa ditambah dari halaman profil.",
  "engineers.create.submit": "Buat teknisi",
  "engineers.create.submitting": "Menyimpan…",
  "engineers.create.cancel": "Batal",
  "engineers.create.requiredHint": "Kolom dengan * wajib diisi.",
  "engineers.detail.assignVisit": "Buat perintah kerja",
  "engineers.detail.profile": "Profil",
  "engineers.detail.skills": "Keahlian",
  "engineers.detail.experience": "Pengalaman",
  "engineers.detail.upcoming": "Pekerjaan mendatang",
  "engineers.detail.upcomingHint": "Perintah kerja terjadwal atau sedang berjalan.",
  "engineers.detail.noUpcoming": "Belum ada perintah kerja terjadwal.",
  "engineers.detail.completedTimeline": "Aktivitas terbaru",
  "engineers.detail.completedTimelineHint":
    "Pekerjaan servis terakhir yang ditangani teknisi ini.",
  "engineers.detail.noCompleted": "Belum ada perintah kerja selesai.",
  "engineers.detail.revenueMtd": "Pendapatan MTD",
  "engineers.detail.lastVisit": "Perintah kerja terakhir",
  "engineers.detail.lifetimeRevenue": "total",
  "engineers.detail.notFound": "Teknisi tidak ditemukan.",
  "customers.stage.prospect": "Prospek",
  "customers.stage.active": "Aktif",
  "customers.stage.vip": "VIP",
  "customers.stage.dormant": "Tidak aktif",
  "customers.stage.title": "Tahap",
  "customers.stage.allStages": "Semua tahap",
  "customers.stage.prospectHint":
    "Masih di pipeline · belum bertransaksi dengan kami.",
  "customers.stage.column": "Tahap",
  "customers.create.lifecycleHint":
    "Pelanggan baru dimulai sebagai Prospek. Otomatis menjadi Aktif saat penawaran pertama disetujui atau faktur dibayar.",
  "settings.company.title": "Perusahaan & Brand",
  "settings.company.description":
    "Identitas perusahaan yang dicetak di setiap penawaran, faktur, dan work order. Logo, cap, dan info rekening diambil dari sini.",
  "settings.company.sectionIdentity": "Identitas",
  "settings.company.sectionBrand": "Aset brand",
  "settings.company.sectionBank": "Detail rekening",
  "settings.company.sectionTerms": "Default",
  "settings.company.sectionWhatsapp": "Template WhatsApp",
  "settings.company.name": "Nama perusahaan",
  "settings.company.tagline": "Tagline",
  "settings.company.address": "Alamat",
  "settings.company.cityRegion": "Kota, provinsi & kode pos",
  "settings.company.country": "Negara",
  "settings.company.phone": "Telepon",
  "settings.company.email": "Email",
  "settings.company.website": "Website",
  "settings.company.npwp": "NPWP",
  "settings.company.bankName": "Bank",
  "settings.company.bankAccountNumber": "Nomor rekening",
  "settings.company.bankAccountHolder": "Atas nama",
  "settings.company.signatoryName": "Nama penanda tangan",
  "settings.company.signatoryTitle": "Jabatan penanda tangan",
  "settings.company.logoLabel": "Logo",
  "settings.company.logoHint":
    "PNG/JPG bujur sangkar. Latar transparan direkomendasikan.",
  "settings.company.stampLabel": "Cap / Stempel",
  "settings.company.stampHint":
    "PNG transparan. Dicetak di samping penanda tangan.",
  "settings.company.signatureLabel": "Tanda tangan",
  "settings.company.signatureHint":
    "Opsional. PNG transparan berisi tanda tangan.",
  "settings.company.uploadCta": "Unggah",
  "settings.company.removeImage": "Hapus",
  "settings.company.defaultTerms": "Syarat & ketentuan default",
  "settings.company.defaultTermsHint":
    "Dicetak di setiap penawaran di bawah blok total.",
  "settings.company.whatsappTemplate": "Template pesan WhatsApp",
  "settings.company.whatsappTemplateHint":
    "Digunakan saat membagikan penawaran via WhatsApp.",
  "settings.company.whatsappPlaceholders":
    "Placeholder: {{customer.name}}, {{customer.contact}}, {{quotation.number}}, {{quotation.title}}, {{quotation.total}}, {{quotation.validUntil}}, {{company.name}}, {{signatory.name}}.",
  "settings.company.savedHint": "Tersimpan otomatis — langsung berlaku.",
  "settings.company.reset": "Kembalikan ke default",
  "settings.company.resetConfirm":
    "Kembalikan semua kolom perusahaan & brand ke nilai default?",
  "quotations.detail.shareWa": "Kirim via WhatsApp",
  "quotations.detail.shareWaInvalidPhone":
    "Pelanggan belum punya nomor telepon valid — pengiriman WhatsApp tidak tersedia.",
  "quotations.detail.shareWaSent": "Dibagikan via WhatsApp",
  "quotations.detail.waDialog.title": "Kirim penawaran ini via WhatsApp",
  "quotations.detail.waDialog.lead":
    "WhatsApp tidak mengizinkan website melampirkan file secara otomatis. Berikut alur 3 langkah yang akan kami jalankan untuk Anda:",
  "quotations.detail.waDialog.step1Title": "Unduh PDF ber-branding",
  "quotations.detail.waDialog.step1Body":
    "Kami akan menyimpan PDF lengkap dengan logo, cap, info rekening, dan total ke folder Downloads.",
  "quotations.detail.waDialog.step2Title": "Buka WhatsApp dengan pesan siap kirim",
  "quotations.detail.waDialog.step2Body":
    "WhatsApp akan terbuka di chat pelanggan dengan template Anda sudah terketik.",
  "quotations.detail.waDialog.step3Title": "Lampirkan PDF — satu ketukan",
  "quotations.detail.waDialog.step3Body":
    "Di WhatsApp, ketuk ikon klip kertas, pilih PDF yang baru saja diunduh, lalu kirim.",
  "quotations.detail.waDialog.attachReason":
    "Kenapa file tidak otomatis terlampir? — WhatsApp memblokir website yang melampirkan file tanpa konfirmasi Anda. Ini alur universal yang dipakai semua CRM tanpa Business API berbayar.",
  "quotations.detail.waDialog.dontShowAgain": "Mengerti — jangan tampilkan lagi",
  "quotations.detail.waDialog.cancel": "Batal",
  "quotations.detail.waDialog.confirm": "Unduh PDF & buka WhatsApp",
  "quotations.detail.waDialog.pdfReady": "PDF berhasil diunduh",
  "quotations.detail.waDialog.pdfReadyHint":
    "Cek folder Downloads Anda, lalu lampirkan di tab WhatsApp.",
  "quotations.detail.waDialog.openWa": "Buka chat WhatsApp",
  "quotations.detail.waDialog.preview": "Pratinjau pesan",
  "quotations.detail.printed.docTitle": "PENAWARAN HARGA",
  "quotations.detail.printed.billTo": "Kepada Yth.",
  "quotations.detail.printed.no": "No.",
  "quotations.detail.printed.date": "Tanggal",
  "quotations.detail.printed.validUntil": "Berlaku hingga",
  "quotations.detail.printed.description": "Deskripsi",
  "quotations.detail.printed.qty": "Qty",
  "quotations.detail.printed.unitPrice": "Harga satuan",
  "quotations.detail.printed.lineTotal": "Total",
  "quotations.detail.printed.subtotal": "Subtotal",
  "quotations.detail.printed.discount": "Diskon",
  "quotations.detail.printed.tax": "PPN",
  "quotations.detail.printed.total": "Total",
  "quotations.detail.printed.paymentTo": "Pembayaran ke",
  "quotations.detail.printed.terms": "Syarat & Ketentuan",
  "quotations.detail.printed.regards": "Hormat kami,",
  "quotations.title": "Penawaran",
  "quotations.description":
    "Susun, kirim, dan pantau penawaran hingga disetujui. Penawaran yang disetujui dikonversi menjadi work order atau kontrak servis.",
  "quotations.new": "Penawaran baru",
  "quotations.searchPlaceholder": "Cari nomor, judul, atau pelanggan…",
  "quotations.empty": "Tidak ada penawaran yang cocok dengan filter ini.",
  "quotations.insight.openCount": "Penawaran terbuka",
  "quotations.insight.openCountCaption":
    "draft + terkirim · menunggu keputusan",
  "quotations.insight.pipeline": "Nilai pipeline",
  "quotations.insight.pipelineCaption": "terkirim · belum diputuskan",
  "quotations.insight.winRate": "Tingkat keberhasilan",
  "quotations.insight.winRateCaption": "disetujui ÷ sudah diputuskan",
  "quotations.insight.expiringSoon": "Berakhir minggu ini",
  "quotations.insight.expiringSoonCaption": "terkirim · valid ≤ 7 hari",
  "quotations.column.quotation": "Penawaran",
  "quotations.column.customer": "Pelanggan",
  "quotations.column.category": "Kategori",
  "quotations.column.status": "Status",
  "quotations.column.total": "Total",
  "quotations.column.validUntil": "Berlaku hingga",
  "quotations.column.owner": "Pemilik",
  "quotations.filter.allCategories": "Semua kategori",
  "quotations.filter.allStatuses": "Semua status",
  "quotations.filter.titleOrNumber": "Filter berdasarkan judul atau nomor",
  "quotations.status.draft": "Draf",
  "quotations.status.sent": "Terkirim",
  "quotations.status.approved": "Disetujui",
  "quotations.status.rejected": "Ditolak",
  "quotations.status.expired": "Kedaluwarsa",
  "quotations.category.service": "Servis",
  "quotations.category.product": "Produk",
  "quotations.category.spare_parts": "Suku Cadang",
  "quotations.category.service_contract": "Kontrak Servis",
  "quotations.create.title": "Buat penawaran baru",
  "quotations.create.description":
    "Susun penawaran baris per baris. Penawaran tersimpan sebagai draf — mengirim ke pelanggan adalah langkah terpisah di halaman detail.",
  "quotations.create.sectionDetails": "Detail",
  "quotations.create.sectionLines": "Item penawaran",
  "quotations.create.sectionTotals": "Total",
  "quotations.create.titleField": "Judul",
  "quotations.create.titlePlaceholder": "contoh: Kontrak perawatan tahunan",
  "quotations.create.category": "Kategori",
  "quotations.create.customer": "Pelanggan",
  "quotations.create.customerPlaceholder": "Ketik untuk mencari pelanggan…",
  "quotations.create.customerNoMatch": "Tidak ada pelanggan yang cocok.",
  "quotations.create.customerCreateNew": "Buat pelanggan baru",
  "quotations.create.customerCreateAsHint":
    "Membuka form pelanggan yang sudah terisi.",
  "quotations.create.validUntil": "Berlaku hingga",
  "quotations.create.notes": "Catatan",
  "quotations.create.notesPlaceholder":
    "Ketentuan, ruang lingkup pekerjaan, pengecualian…",
  "quotations.create.lineDescription": "Deskripsi",
  "quotations.create.lineDescriptionPlaceholder": "Layanan atau barang",
  "quotations.create.lineQty": "Qty",
  "quotations.create.lineUnitPrice": "Harga satuan",
  "quotations.create.lineTotal": "Total",
  "quotations.create.addLine": "Tambah baris",
  "quotations.create.removeLine": "Hapus baris",
  "quotations.create.discountPct": "Diskon %",
  "quotations.create.taxPct": "Pajak %",
  "quotations.create.subtotal": "Subtotal",
  "quotations.create.discountAmount": "Diskon",
  "quotations.create.taxAmount": "Pajak",
  "quotations.create.total": "Total",
  "quotations.create.submit": "Simpan draf",
  "quotations.create.submitting": "Menyimpan…",
  "quotations.create.cancel": "Batal",
  "quotations.create.requiredHint":
    "Kolom dengan * wajib diisi. Penawaran baru tersimpan sebagai draf.",
  "quotations.detail.notFound": "Penawaran tidak ditemukan.",
  "quotations.detail.subtotal": "Subtotal",
  "quotations.detail.discount": "Diskon",
  "quotations.detail.tax": "Pajak",
  "quotations.detail.total": "Total",
  "quotations.detail.validUntil": "Berlaku hingga",
  "quotations.detail.validityRemaining": "tersisa",
  "quotations.detail.expired": "kedaluwarsa",
  "quotations.detail.lineItems": "Item penawaran",
  "quotations.detail.lineCount": "item",
  "quotations.detail.notes": "Catatan",
  "quotations.detail.history": "Riwayat",
  "quotations.detail.drafted": "Dibuat sebagai draf",
  "quotations.detail.sentToCustomer": "Terkirim ke pelanggan",
  "quotations.detail.send": "Kirim ke pelanggan",
  "quotations.detail.markApproved": "Tandai disetujui",
  "quotations.detail.markRejected": "Tandai ditolak",
  "quotations.detail.downloadPdf": "Unduh PDF",
  "quotations.detail.nextStep": "Langkah berikutnya",
  "quotations.detail.nextStepHint":
    "Konversi penawaran yang disetujui menjadi entitas yang tepat.",
  "quotations.detail.convertWorkOrder": "Buat work order",
  "quotations.detail.convertContract": "Buka kontrak servis",
  "quotations.detail.convertInvoice": "Buat faktur",
  "quotations.detail.customer": "Pelanggan",
  "quotations.detail.owner": "Pemilik",
  "contracts.title": "Kontrak servis",
  "contracts.description":
    "Perjanjian pemeliharaan berulang. Setiap kontrak aktif membuat perintah kerja terjadwal sesuai frekuensi.",
  "contracts.new": "Kontrak baru",
  "contracts.searchPlaceholder": "Cari kontrak, pelanggan, teknisi…",
  "contracts.empty": "Tidak ada kontrak yang cocok.",
  "contracts.insight.active": "Kontrak aktif",
  "contracts.insight.activeCaption": "Sedang menghasilkan perintah kerja",
  "contracts.insight.recurringValue": "Nilai berulang",
  "contracts.insight.recurringValueCaption": "Total kontrak aktif + akan berakhir",
  "contracts.insight.expiringSoon": "Segera berakhir",
  "contracts.insight.expiringSoonCaption": "Perpanjang dalam 30 hari",
  "contracts.insight.awaitingRenewal": "Menunggu perpanjangan",
  "contracts.insight.awaitingRenewalCaption": "Lewat tanggal akhir, belum ditutup",
  "contracts.column.contract": "Kontrak",
  "contracts.column.customer": "Pelanggan",
  "contracts.column.type": "Jenis",
  "contracts.column.frequency": "Frekuensi",
  "contracts.column.status": "Status",
  "contracts.column.engineer": "Teknisi utama",
  "contracts.column.coverage": "Periode",
  "contracts.column.value": "Nilai",
  "contracts.filter.numberOrCustomer": "Nomor kontrak atau pelanggan",
  "contracts.status.draft": "Draft",
  "contracts.status.active": "Aktif",
  "contracts.status.expiring_soon": "Segera berakhir",
  "contracts.status.awaiting_renewal": "Menunggu perpanjangan",
  "contracts.status.completed": "Selesai",
  "contracts.type.ac_cleaning": "Cuci AC",
  "contracts.type.ac_replacement": "Ganti Unit AC",
  "contracts.type.spare_part_replacement": "Ganti Suku Cadang",
  "contracts.type.preventive_maintenance": "Perawatan Berkala",
  "contracts.type.custom": "Paket Custom",
  "contracts.frequency.monthly": "Bulanan",
  "contracts.frequency.quarterly": "Triwulanan",
  "contracts.frequency.biannual": "Setiap 6 bulan",
  "contracts.frequency.annual": "Tahunan",
  "contracts.frequency.custom": "Interval custom",
  "contracts.create.title": "Kontrak servis baru",
  "contracts.create.description":
    "Kunci hubungan pemeliharaan berulang. Pegasus akan membuat perintah kerja terjadwal sesuai frekuensi yang dipilih.",
  "contracts.create.sectionParties": "Pihak terkait",
  "contracts.create.sectionTerms": "Syarat & cakupan",
  "contracts.create.sectionCoverage": "Cakupan unit",
  "contracts.create.customer": "Pelanggan",
  "contracts.create.customerPlaceholder":
    "Cari pelanggan berdasarkan nama atau perusahaan…",
  "contracts.create.customerNoMatch": "Tidak ada pelanggan cocok.",
  "contracts.create.customerCreateNew": "Buat pelanggan baru",
  "contracts.create.engineer": "Teknisi utama",
  "contracts.create.engineerPlaceholder": "Pilih teknisi utama…",
  "contracts.create.engineerLead":
    "Teknisi utama pada setiap perintah kerja berulang. Bisa diganti per kunjungan.",
  "contracts.create.type": "Jenis kontrak",
  "contracts.create.frequency": "Frekuensi servis",
  "contracts.create.customIntervalDays": "Interval custom (hari)",
  "contracts.create.startDate": "Tanggal mulai",
  "contracts.create.endDate": "Tanggal berakhir",
  "contracts.create.duration": "Durasi",
  "contracts.create.value": "Nilai kontrak",
  "contracts.create.valueHint":
    "Total nilai tahunan / kontrak (untuk proyeksi pendapatan berulang).",
  "contracts.create.notes": "Cakupan & ketentuan khusus",
  "contracts.create.notesPlaceholder":
    "Yang dicakup / tidak, kewajiban pelanggan, jadwal penagihan…",
  "contracts.create.units": "Unit AC yang dicakup",
  "contracts.create.unitsHint":
    "Pilih unit AC pelanggan yang dicakup. Kosongkan untuk mencakup semua unit (sekarang dan masa depan).",
  "contracts.create.unitsNone": "Pelanggan ini belum punya unit AC terdaftar.",
  "contracts.create.submit": "Buat kontrak",
  "contracts.create.submitting": "Menyimpan…",
  "contracts.create.cancel": "Batal",
  "contracts.create.requiredHint":
    "Pelanggan, jenis, frekuensi, tanggal, teknisi, dan nilai wajib diisi.",
  "contracts.create.previewSchedule": "Pratinjau jadwal",
  "contracts.create.previewScheduleHint":
    "4 tanggal perintah kerja pertama yang akan dibuat Pegasus.",
  "contracts.detail.notFound": "Kontrak tidak ditemukan.",
  "contracts.detail.contractValue": "Nilai kontrak",
  "contracts.detail.workOrdersCompleted": "Perintah kerja selesai",
  "contracts.detail.workOrdersTotal": "Sepanjang masa kontrak",
  "contracts.detail.nextWorkOrder": "Perintah kerja berikutnya",
  "contracts.detail.workOrderSchedule": "Jadwal perintah kerja",
  "contracts.detail.workOrderScheduleHint":
    "Semua kunjungan dari kontrak ini. Klik untuk membuka perintah kerja.",
  "contracts.detail.noWorkOrders":
    "Belum ada perintah kerja. Aktifkan kontrak untuk memulai jadwal.",
  "contracts.detail.coverage": "Periode",
  "contracts.detail.terms": "Cakupan & ketentuan",
  "contracts.detail.units": "Unit AC dicakup",
  "contracts.detail.unitsHint":
    "Daftar kosong berarti kontrak mencakup semua unit AC pelanggan.",
  "contracts.detail.scheduleNext": "Jadwalkan perintah kerja berikutnya",
  "contracts.detail.markCompleted": "Tandai selesai",
  "contracts.detail.markRenewed": "Tandai diperpanjang",
  "contracts.detail.markActivated": "Aktifkan kontrak",
  // ───────── Work orders (list page) ─────────
  "workOrders.title": "Perintah kerja",
  "workOrders.description":
    "Setiap perintah kerja tim — pekerjaan kontrak berulang maupun tugas sekali jalan.",
  "workOrders.new": "Perintah kerja baru",
  "workOrders.searchPlaceholder": "Cari nomor, pelanggan, teknisi…",
  "workOrders.empty": "Tidak ada perintah kerja yang cocok dengan filter ini.",
  "workOrders.insight.scheduled": "Terjadwal",
  "workOrders.insight.scheduledCaption": "Akan datang di kalender",
  "workOrders.insight.inProgress": "Sedang berjalan",
  "workOrders.insight.inProgressCaption": "Teknisi di lokasi saat ini",
  "workOrders.insight.completed": "Selesai",
  "workOrders.insight.completedCaption": "Sudah ditutup & ditandatangani",
  "workOrders.insight.overdue": "Terlambat",
  "workOrders.insight.overdueCaption": "Lewat jadwal namun belum dimulai",
  "workOrders.column.workOrder": "Perintah kerja",
  "workOrders.column.customer": "Pelanggan",
  "workOrders.column.type": "Jenis",
  "workOrders.column.engineer": "Teknisi",
  "workOrders.column.status": "Status",
  "workOrders.column.scheduled": "Terjadwal",
  "workOrders.column.duration": "Durasi",
  "workOrders.column.revenue": "Pendapatan",
  "workOrders.filter.numberOrCustomer": "Nomor atau pelanggan",
  "workOrders.status.scheduled": "Terjadwal",
  "workOrders.status.in_progress": "Sedang berjalan",
  "workOrders.status.completed": "Selesai",
  "workOrders.status.overdue": "Terlambat",
  "workOrders.status.cancelled": "Dibatalkan",
  "workOrders.duration.notLogged": "Belum dicatat",
  "workOrders.source.contract": "Kontrak",
  "workOrders.source.quotation": "Penawaran",
  "workOrders.source.adhoc": "Ad-hoc",
  // ───────── Scheduling ─────────
  "scheduling.title": "Jadwal servis",
  "scheduling.description":
    "Tampilan kalender setiap perintah kerja — lihat beban hari ini, telusuri per hari, dan kenali teknisi yang butuh bantuan.",
  "scheduling.new": "Perintah kerja baru",
  "scheduling.book": "Pesan",
  "scheduling.searchPlaceholder": "Cari nomor, pelanggan, teknisi…",
  "scheduling.insight.today": "Hari ini",
  "scheduling.insight.todayCaption": "Perintah kerja hari ini",
  "scheduling.insight.thisWeek": "Minggu ini",
  "scheduling.insight.thisWeekCaption": "Min–Sab seluruh teknisi",
  "scheduling.insight.inProgress": "Berjalan sekarang",
  "scheduling.insight.inProgressCaption": "Belum ada teknisi di lokasi",
  "scheduling.insight.attention": "Perlu perhatian",
  "scheduling.insight.attentionCaption": "Terlambat + belum ditugaskan",
  "scheduling.insight.attentionAllClear": "Jadwal terlihat bersih",
  "scheduling.delta.vsYesterday": "vs kemarin",
  "scheduling.delta.vsLastWeek": "vs minggu lalu",
  "scheduling.footer.completed": "Selesai",
  "scheduling.footer.inProgress": "Aktif",
  "scheduling.footer.remaining": "Sisa",
  "scheduling.footer.coverage": "Ditugaskan",
  "scheduling.footer.busiest": "Hari tersibuk",
  "scheduling.footer.avgDuration": "Durasi rata-rata",
  "scheduling.footer.longest": "Terlama",
  "scheduling.footer.overdue": "Terlambat",
  "scheduling.footer.unassigned": "Belum ditugaskan",
  "scheduling.calendar.tapDay": "Klik tanggal mana saja untuk lihat jadwal",
  "scheduling.filter.engineer": "Teknisi",
  "scheduling.day.empty": "Tidak ada jadwal di hari ini.",
  "scheduling.day.stopsOne": "kunjungan",
  "scheduling.day.stopsMany": "kunjungan",
  "scheduling.day.engineerOne": "teknisi",
  "scheduling.day.engineerMany": "teknisi",
  "scheduling.workload.title": "Beban kerja teknisi",
  "scheduling.workload.hint": "Kunjungan minggu ini per teknisi. Klik kartu untuk memfilter.",
  "scheduling.workload.empty": "Belum ada teknisi dengan kunjungan minggu ini.",
  "scheduling.workload.stopsOne": "kunjungan",
  "scheduling.workload.stopsMany": "kunjungan",
  "scheduling.workload.overdue": "terlambat",
  "scheduling.workload.completed": "selesai",
  "scheduling.workload.filteringHint": "Memfilter",
  "scheduling.workload.idle": "kosong",
  "scheduling.workload.now": "sedang",
  "scheduling.workload.teamStops": "kunjungan tim minggu ini",
  "scheduling.workload.fullyBooked": "tim terisi penuh",
  "scheduling.metric.today": "Hari ini",
  "scheduling.metric.week": "Minggu",
  "scheduling.metric.active": "Aktif",
  "scheduling.metric.risk": "Risiko",
  "scheduling.day.next": "Berikut",
  "scheduling.day.dayCapacity": "Kapasitas harian ≈ 8 kunjungan",
  // ───────── Work orders (detail page) ─────────
  "workOrders.detail.notFound": "Perintah kerja tidak ditemukan.",
  "workOrders.detail.loading": "Memuat…",
  "workOrders.detail.start": "Mulai layanan",
  "workOrders.detail.markComplete": "Tandai selesai",
  "workOrders.detail.completeChecklistFirst": "Selesaikan ceklis dulu",
  "workOrders.detail.signedBadge": "Ditandatangani",
  "workOrders.detail.checklistRemaining": "untuk diverifikasi",
  "workOrders.detail.checklistAllDone": "Semua beres",
  "workOrders.detail.ratingNone": "Belum dinilai",
  "workOrders.detail.ratingReviewed": "Diulas pelanggan",
  "workOrders.detail.revenueLogged": "Dicatat pada kunjungan ini",
  "workOrders.detail.revenueUnbilled": "Menunggu penutupan",
  "workOrders.detail.rail.customer": "Pelanggan",
  "workOrders.detail.rail.engineer": "Teknisi",
  "workOrders.detail.rail.contact": "Kontak",
  "workOrders.detail.rail.location": "Lokasi",
  "workOrders.detail.rail.notes": "Catatan teknisi",
  "workOrders.detail.rail.linked": "Terhubung",
  "workOrders.detail.rail.linkedContract": "Kontrak layanan",
  "workOrders.detail.rail.linkedQuotation": "Penawaran",
  "workOrders.detail.tab.checklist": "Ceklis",
  "workOrders.detail.tab.units": "Unit",
  "workOrders.detail.tab.documentation": "Dokumentasi",
  "workOrders.detail.tab.timeline": "Linimasa",
  "workOrders.detail.checklist.hint":
    "Semua item harus dicentang sebelum menutup perintah kerja ini.",
  "workOrders.detail.checklist.empty":
    "Tidak ada item ceklis untuk kunjungan ini.",
  "workOrders.detail.units.empty":
    "Tidak ada unit khusus yang terhubung dengan kunjungan ini.",
  "workOrders.detail.docs.hint":
    "Foto sebelum/sesudah dan tanda tangan pelanggan.",
  "workOrders.detail.docs.uploadPhoto": "Unggah foto",
  "workOrders.detail.docs.signatureLabel": "Tanda tangan pelanggan",
  "workOrders.detail.docs.signatureCaptured": "Ditandatangani oleh",
  "workOrders.detail.docs.signatureMissing": "Belum diambil",
  "workOrders.detail.docs.captureSignature": "Ambil tanda tangan",
  "workOrders.detail.timeline.scheduled": "Terjadwal",
  "workOrders.detail.timeline.started": "Dimulai",
  "workOrders.detail.timeline.completed": "Selesai & ditandatangani",
  "workOrders.detail.timeline.now": "Sekarang",
  // ───────── My Tasks (engineer landing) ─────────
  "myTasks.subtitle": "Berikut semua tugasmu hari ini dan minggu ini.",
  "myTasks.openCalendar": "Buka kalender",
  "myTasks.insight.today": "Hari ini",
  "myTasks.insight.todayCaption": "Pemberhentian terjadwal hari ini",
  "myTasks.insight.upcoming": "Akan datang",
  "myTasks.insight.upcomingCaption": "Setelah hari ini",
  "myTasks.insight.completed": "Selesai (7h)",
  "myTasks.insight.completedCaption": "Diselesaikan minggu ini",
  "myTasks.insight.rating": "Rating kamu",
  "myTasks.insight.ratingCaption": "Skor rata-rata pelanggan",
  "myTasks.insight.ratingNone": "Belum ada rating",
  "myTasks.today.title": "Hari ini",
  "myTasks.today.empty": "Tidak ada tugas hari ini. Nikmati kopinya.",
  "myTasks.today.stopsOne": "pemberhentian",
  "myTasks.today.stopsMany": "pemberhentian",
  "myTasks.upcoming.title": "Akan datang",
  "myTasks.upcoming.hint": "Perintah kerja terjadwal berikutnya",
  "myTasks.upcoming.empty": "Jadwalmu kosong setelah hari ini.",
  // ───────── Finance · shared (column headers + filters) ─────────
  "finance.column.invoice": "Tagihan",
  "finance.column.customer": "Pelanggan",
  "finance.column.source": "Sumber",
  "finance.column.issued": "Diterbitkan",
  "finance.column.due": "Jatuh tempo",
  "finance.column.status": "Status",
  "finance.column.method": "Metode",
  "finance.column.amount": "Jumlah",
  "finance.allTime": "Semua waktu",
  // ───────── Finance · Invoices list ─────────
  "invoices.title": "Tagihan",
  "invoices.description":
    "Setiap tagihan yang diterbitkan — lunas, terutang, dan lewat jatuh tempo. Pembukuan terjadi di sini.",
  "invoices.new": "Tagihan baru",
  "invoices.searchPlaceholder": "Cari nomor, pelanggan, sumber…",
  "invoices.empty": "Tidak ada tagihan yang cocok dengan filter ini.",
  "invoices.insight.totalBilled": "Total tagihan",
  "invoices.insight.totalBilledCaption": "Seluruh buku besar",
  "invoices.insight.collected": "Diterima",
  "invoices.insight.collectedCaption": "Pembayaran masuk",
  "invoices.insight.outstanding": "Terutang",
  "invoices.insight.outstandingCaption": "Menunggu pembayaran pelanggan",
  "invoices.insight.overdue": "Lewat jatuh tempo",
  "invoices.insight.overdueCaption": "Sudah melewati tenggat",
  "invoices.filter.numberOrCustomer": "Nomor atau pelanggan",
  "invoices.status.draft": "Draf",
  "invoices.status.sent": "Dikirim",
  "invoices.status.paid": "Lunas",
  "invoices.status.partially_paid": "Sebagian lunas",
  "invoices.status.overdue": "Lewat jatuh tempo",
  "invoices.status.cancelled": "Dibatalkan",
  "invoices.source.service_job": "Pekerjaan servis",
  "invoices.source.product_sale": "Penjualan produk",
  "invoices.source.spare_part_sale": "Penjualan suku cadang",
  "invoices.source.service_contract": "Kontrak servis",
  "invoices.method.cash": "Tunai",
  "invoices.method.bank_transfer": "Transfer bank",
  "invoices.method.credit_card": "Kartu kredit",
  "invoices.method.ewallet": "E-wallet",
  "invoices.method.check": "Cek",
  "invoices.method.unpaid": "—",
  // ───────── Finance · New invoice ─────────
  "invoices.new.title": "Catat tagihan",
  "invoices.new.description":
    "Terbitkan tagihan untuk satu kali servis, penjualan produk atau suku cadang, atau milestone kontrak.",
  "invoices.new.section.parties": "Pihak terkait",
  "invoices.new.section.terms": "Syarat",
  "invoices.new.section.line": "Item",
  "invoices.new.field.customer": "Pelanggan",
  "invoices.new.field.source": "Sumber",
  "invoices.new.field.amount": "Jumlah",
  "invoices.new.field.issuedAt": "Tanggal terbit",
  "invoices.new.field.dueAt": "Jatuh tempo",
  "invoices.new.field.method": "Metode pembayaran",
  "invoices.new.field.notes": "Catatan (opsional)",
  "invoices.new.cta": "Simpan tagihan",
  "invoices.new.demoNote":
    "Hanya demo — sambungkan form ini ke mutation untuk menyimpan tagihan asli.",
  "invoices.new.backToInvoices": "Kembali ke tagihan",
  // ───────── Finance · Invoices date-range filter ─────────
  "invoices.dateRange.label": "Rentang tanggal",
  "invoices.dateRange.clear": "Hapus",
  "invoices.dateRange.toLabel": "s/d",
  // ───────── Finance · Expenses list ─────────
  "expenses.title": "Pengeluaran",
  "expenses.description":
    "Setiap pengeluaran operasional — BBM, gaji, suku cadang, peralatan, dan biaya umum. Uang yang keluar.",
  "expenses.searchPlaceholder": "Cari deskripsi, vendor, kategori…",
  "expenses.empty": "Tidak ada pengeluaran yang cocok dengan filter ini.",
  "expenses.recordEntry": "Catat pengeluaran",
  "expenses.filter.descriptionOrVendor": "Deskripsi atau vendor",
  "expenses.insight.totalSpend": "Total pengeluaran",
  "expenses.insight.totalSpendCaption": "Seluruh buku besar",
  "expenses.insight.biggestCategory": "Kategori terbesar",
  "expenses.insight.biggestCategoryCaption": "Pos pengeluaran terbesar",
  "expenses.insight.entries": "Entri",
  "expenses.insight.entriesCaption": "Total catatan pengeluaran",
  "expenses.insight.biggestVendor": "Vendor terbesar",
  "expenses.insight.biggestVendorCaption": "Pemasok tunggal terbesar",
  "expenses.column.description": "Deskripsi",
  "expenses.column.category": "Kategori",
  "expenses.column.vendor": "Vendor",
  "expenses.column.recordedBy": "Dicatat oleh",
  "expenses.column.date": "Tanggal",
  "expenses.column.amount": "Jumlah",
  // ───────── Expenses meta ─────────
  "expenses.category.fuel": "BBM",
  "expenses.category.transport": "Transportasi",
  "expenses.category.spare_parts": "Suku cadang",
  "expenses.category.tools": "Peralatan",
  "expenses.category.salaries": "Gaji",
  "expenses.category.rent": "Sewa",
  "expenses.category.utilities": "Utilitas",
  "expenses.category.marketing": "Pemasaran",
  "expenses.category.misc": "Lain-lain",
  // ───────── Reports ─────────
  "reports.title": "Laporan",
  "reports.description":
    "Penjualan, performa teknisi, kontrak, pelanggan teratas, laba-rugi dan lainnya.",
  "reports.insight.income6mo": "Pemasukan (6bln)",
  "reports.insight.income6moCaption": "Enam bulan terakhir",
  "reports.insight.expenses6mo": "Pengeluaran (6bln)",
  "reports.insight.expenses6moCaption": "Enam bulan terakhir",
  "reports.insight.profit6mo": "Laba (6bln)",
  "reports.insight.profit6moCaption": "Pemasukan dikurangi pengeluaran",
  "reports.insight.winRate": "Konversi penawaran",
  "reports.insight.winRateCaption": "Disetujui dari total",
  "reports.pnl.title": "Laba & Rugi",
  "reports.pnl.description": "6 bulan terakhir — pemasukan, pengeluaran, bersih.",
  "reports.topCustomers.title": "Pelanggan teratas",
  "reports.topCustomers.description": "Berdasarkan total pendapatan diterima.",
  "reports.engineerLeaderboard.title": "Peringkat teknisi",
  "reports.engineerLeaderboard.description":
    "Pekerjaan selesai + pendapatan year-to-date.",
  "reports.frequentServices.title": "Layanan terpopuler",
  "reports.frequentServices.description":
    "Perintah kerja selesai per jenis layanan.",
  "reports.expensesByCategory.title": "Pengeluaran per kategori",
  "reports.expensesByCategory.description": "Ke mana uang mengalir.",
  "reports.contractHealth.title": "Status kontrak",
  "reports.contractHealth.description": "Distribusi status semua kontrak.",
  "reports.engineer.jobsSuffix": "pekerjaan",
};

export const DICTIONARIES: Record<Locale, Dictionary> = { en, id };
