# Presentation: Judging Points & Q&A

Guidelines to highlight during evaluation and anticipated questions.

---

## 1. Key Highlights & Business Value

* **Single Source of Truth (`shared/` / `database/`)**: Architecture utilizes unified contracts for schemas, API endpoints, permissions, and validations. This guarantees zero replication and consistent business rule enforcement.
* **Auto-Cascade Workflows**: System automates state changes. Audit failures (missing/damaged) auto-trigger status lockouts, notification alerts, and maintenance tickets, reducing administration lag.
* **Dynamic Specifications (No SQL Migrations)**: The database category-spec design supports onboarding new asset types (e.g. Laptops, Vehicles, Chairs) with custom attributes on-the-fly without database migrations.
* **High Availability Booking Overlap Checks**: Real-time DB query-validation checks prevent resource double-bookings during checkouts.

---

## 2. Innovation & AI Integration

* **AI-Ready Audit Parsing**: System logs are formatted as structured JSON activity metadata, ready to feed into AI anomaly models to flag suspicious checkouts or unauthorized transfers.
* **Predictive Maintenance Prep**: Historical maintenance logs store structured descriptions and costs. An AI co-pilot or ML regression model can parse these to predict failure intervals based on asset age and category.

---

## 3. Anticipated Questions & Answers

### Q1: How does your system guarantee that an asset is not double-allocated?
* **Answer**: We enforce this at the database engine level. We use a MongoDB partial unique index (`idx_allocations_active_unique`) on the `allocations` collection for `{ assetId: 1 }` where `{ status: "ACTIVE" }`. This index makes it physically impossible to write two active assignments for the same asset ID in the database.

### Q2: How does the dynamic specification feature work without breaking schema validations?
* **Answer**: Categories define the metadata for custom attributes (e.g., field name, field type, required boolean) in a sub-document array. The `assets` collection stores these specifications inside a flexible `specs` map. On registration or update, the backend queries the category metadata and validates the key-value structures programmatically before committing them.

### Q3: What happens if an employee attempts to book an asset that is currently undergoing repair?
* **Answer**: The booking controller validates that the target asset's status is `AVAILABLE` and its `bookable` flag is `true`. Since starting or approving a maintenance ticket changes the asset status to `UNDER_MAINTENANCE`, the booking check will immediately reject the request.

### Q4: How is security handled on route endpoints?
* **Answer**: Authentication is powered by JWT. Route registration in Express is wrapped by two middleware layers: `authenticate` (verifies token integrity and extracts the user) and `authorize(...roles)` (compares user role against the permissions matrix defined in `shared/constants/permissions.md`).
