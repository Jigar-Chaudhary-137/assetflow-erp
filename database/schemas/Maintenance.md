# Schema: Maintenance

## Collection Purpose
The `maintenances` collection logs hardware errors, schedules regular maintenance cycles, assigns technicians, tracks expenditures, and tracks approval workflows for asset repair.

---

## Fields & Data Types

| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Yes | Auto-generated | MongoDB standard unique identifier |
| `assetId` | ObjectId | Yes | None | References `_id` in `assets` collection |
| `reportedById` | ObjectId | Yes | None | References `_id` in `users` collection |
| `reportedDate` | Date | Yes | `Date.now` | UTC timestamp when issue was submitted |
| `issueDescription` | String | Yes | None | Trimmed, 10 to 500 characters describing the hardware issue |
| `priority` | String | Yes | `LOW` | Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `status` | String | Yes | `PENDING` | Enum: `PENDING`, `APPROVED`, `REJECTED`, `TECHNICIAN_ASSIGNED`, `IN_PROGRESS`, `RESOLVED` |
| `approvedById` | ObjectId | No | null | References `_id` in `users` (Asset Manager or Department Head) |
| `approvalDate` | Date | No | null | UTC timestamp of approval decision |
| `technicianId` | ObjectId | No | null | References `_id` in `users` collection (assigned technician) |
| `maintenanceType` | String | Yes | `CORRECTIVE` | Enum: `PREVENTIVE`, `CORRECTIVE` |
| `scheduledDate` | Date | No | null | Proposed repair schedule date |
| `completionDate` | Date | No | null | Actual date work was finished |
| `resolutionDetails` | String | No | null | Description of fixes applied |
| `cost` | Number | Yes | `0` | Non-negative repair cost |
| `createdAt` | Date | Yes | `Date.now` | UTC timestamp of request creation |
| `updatedAt` | Date | Yes | `Date.now` | UTC timestamp of last update |

---

## Relationships
- **assetId**: Links to the `assets` collection (`_id`).
- **reportedById**: Links to the `users` collection (`_id`).
- **approvedById**: Links to the `users` collection (`_id`).
- **technicianId**: Links to the `users` collection (`_id`).

---

## Indexes

| Index Name | Index Key(s) | Type | Unique | Purpose |
| :--- | :--- | :--- | :---: | :--- |
| `idx_maintenances_assetId` | `{ assetId: 1 }` | B-tree | No | Finding all maintenance requests for an asset |
| `idx_maintenances_status` | `{ status: 1 }` | B-tree | No | Filtering active/pending repair requests |
| `idx_maintenances_technician` | `{ technicianId: 1 }` | B-tree | No | Fetching assigned tasks for a technician |

---

## Business Rules
1. **Approval Hierarchy**: Maintenance requests initiated by an `EMPLOYEE` start as `PENDING` and must be set to `APPROVED` or `REJECTED` by a user with role `ASSET_MANAGER` or `DEPARTMENT_HEAD` (populating `approvedById` and `approvalDate`).
2. **Asset Status Lock**:
   - Transitioning status to `APPROVED` or `IN_PROGRESS` automatically changes the referenced asset's status to `UNDER_MAINTENANCE` and locks the asset from new allocations or bookings.
3. **Resolution & Release**:
   - When status is updated to `RESOLVED`, the asset's status must revert to `AVAILABLE` (or updated according to manual inspection if it needs retirement).
   - The condition of the asset can be updated in `assets` collection based on the resolution (e.g. from `DAMAGED` to `GOOD`).
4. **Financial Cap**: `cost` must be zero or a positive decimal number.

---

## Example Document
```json
{
  "_id": { "$oid": "64b0f3e8c1e2f7b8a5d4e501" },
  "assetId": { "$oid": "64b0f3e8c1e2f7b8a5d4e301" },
  "reportedById": { "$oid": "64b0f3e8c1e2f7b8a5d4e104" },
  "reportedDate": { "$date": "2026-07-12T04:20:00.000Z" },
  "issueDescription": "Macbook screen flickers and shows green lines when hot.",
  "priority": "HIGH",
  "status": "APPROVED",
  "approvedById": { "$oid": "64b0f3e8c1e2f7b8a5d4e103" },
  "approvalDate": { "$date": "2026-07-12T04:30:00.000Z" },
  "technicianId": { "$oid": "64b0f3e8c1e2f7b8a5d4e109" },
  "maintenanceType": "CORRECTIVE",
  "scheduledDate": { "$date": "2026-07-13T09:00:00.000Z" },
  "completionDate": null,
  "resolutionDetails": null,
  "cost": 0,
  "createdAt": { "$date": "2026-07-12T04:20:00.000Z" },
  "updatedAt": { "$date": "2026-07-12T04:30:00.000Z" }
}
```
