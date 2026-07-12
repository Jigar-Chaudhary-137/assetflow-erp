# AssetFlow ERP - Database Architecture Blueprint

This directory houses the complete database design, schemas, seed files, and sample data for the **AssetFlow - Enterprise Asset & Resource Management System** database.

---

## Folder Structure and Purpose

```text
database/
├── diagrams/
│   ├── er-diagram.md         # Mermaid entity relationship diagram mapping collections
│   └── database-flow.md      # Flowchart tracing state updates throughout asset lifecycle
├── schemas/
│   ├── User.md               # Collection: users
│   ├── Department.md         # Collection: departments
│   ├── Category.md           # Collection: categories
│   ├── Asset.md              # Collection: assets
│   ├── Allocation.md         # Collection: allocations
│   ├── Booking.md            # Collection: bookings
│   ├── Maintenance.md        # Collection: maintenances
│   ├── Audit.md              # Collection: audits
│   ├── Notification.md       # Collection: notifications
│   └── ActivityLog.md        # Collection: activitylogs
├── seed/
│   ├── departments.json      # Base department records (hierarchical code setup)
│   ├── users.json            # Base system users with BCrypt password hashes
│   ├── categories.json       # Asset categories defining dynamic spec parameters
│   └── assets.json           # Physical assets conforming to categories
├── sample-data/
│   ├── asset-sample.json     # Detailed asset document with historic transaction events
│   ├── booking-sample.json   # Bookings exemplifying reservation slots
│   ├── maintenance-sample.json# Maintenance tickets charting workflows
│   └── audit-sample.json     # Audit records logging verification runs
└── README.md                 # This documentation blueprint file
```

---

## Collections Overview

| # | Collection Name | Primary Key | Key Relationships | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `users` | `_id` | `departmentId` -> `departments` | Store credentials, user contact info, status, and permissions role. |
| 2 | `departments` | `_id` | `managerId` -> `users`, `parentDepartmentId` -> `departments` | Define business divisions, department hierarchy, and heads. |
| 3 | `categories` | `_id` | None | Defines asset category codes and schemas for dynamic fields. |
| 4 | `assets` | `_id` | `categoryId` -> `categories`, `departmentId` -> `departments` | Track core physical assets, condition, locations, and specs. |
| 5 | `allocations` | `_id` | `assetId` -> `assets`, `employeeId` -> `users` | Log assignments of available inventory to employees. |
| 6 | `bookings` | `_id` | `resourceId` -> `assets`, `employeeId` -> `users` | Schedule short-term reservations of shared bookable spaces/tools. |
| 7 | `maintenances` | `_id` | `assetId` -> `assets`, `reportedById`/`technicianId` -> `users` | Track repairs, approvals, costs, and resolution notes. |
| 8 | `audits` | `_id` | `auditorId` -> `users`, target filters -> `departments`/`categories` | Plan and record results of organizational asset checks. |
| 9 | `notifications`| `_id` | `receiverId` -> `users`, polymorphic target entities | Log automated email/alert logs triggered on state updates. |
| 10| `activitylogs` | `_id` | `userId` -> `users` | Maintain an immutable audit trail of changes for compliance. |

---

## Key Indexing Strategy

1. **Unique Identifiers**: Unique indexes enforce integrity on keys:
   - `users`: `{ username: 1 }` and `{ email: 1 }`
   - `departments`: `{ name: 1 }` and `{ code: 1 }`
   - `categories`: `{ name: 1 }` and `{ code: 1 }`
   - `assets`: `{ assetTag: 1 }` and `{ serialNumber: 1 }`
2. **Compound & Query Optimization**:
   - `allocations`: Partial unique index on `{ assetId: 1 }` where `{ status: "ACTIVE" }` guarantees an asset is never double-allocated.
   - `bookings`: Compound index `{ resourceId: 1, status: 1, startTime: 1, endTime: 1 }` optimizes time-slot overlap check lookups.
   - `notifications`: Compound index `{ receiverId: 1, readStatus: 1 }` speeds up unread status count badges.
3. **Foreign Keys**: Standard indexes are created on reference fields like `departmentId`, `categoryId`, `employeeId`, `assetId`, and `status` to ensure fast JOIN lookups via MongoDB `$lookup` aggregation stages.

---

## Seed Data Import Instructions

To seed a local MongoDB database with the provided dataset, you can use the `mongoimport` CLI utility. Replace `mongodb://localhost:27017/assetflow` with your target connection string:

```bash
# Import Categories (Prerequisite for Assets)
mongoimport --db assetflow --collection categories --file seed/categories.json --jsonArray --mode merge

# Import Departments (Prerequisite for Users)
mongoimport --db assetflow --collection departments --file seed/departments.json --jsonArray --mode merge

# Import Users
mongoimport --db assetflow --collection users --file seed/users.json --jsonArray --mode merge

# Import Assets
mongoimport --db assetflow --collection assets --file seed/assets.json --jsonArray --mode merge
```

Alternatively, a Node.js seed script can utilize Mongoose models to read these files and run `insertMany()` operations:

```javascript
const mongoose = require('mongoose');
const fs = require('fs');

async function seedDB() {
  await mongoose.connect('mongodb://localhost:27017/assetflow');
  
  const categories = JSON.parse(fs.readFileSync('./seed/categories.json', 'utf-8'));
  const departments = JSON.parse(fs.readFileSync('./seed/departments.json', 'utf-8'));
  const users = JSON.parse(fs.readFileSync('./seed/users.json', 'utf-8'));
  const assets = JSON.parse(fs.readFileSync('./seed/assets.json', 'utf-8'));

  await Category.insertMany(categories);
  await Department.insertMany(departments);
  await User.insertMany(users);
  await Asset.insertMany(assets);

  console.log("Database seeded successfully!");
  process.exit();
}
```
