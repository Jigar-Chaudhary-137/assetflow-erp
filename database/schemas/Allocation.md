# Schema: Allocation

## Collection Purpose
The `allocations` collection stores transaction records for asset assignments to employees. It tracks which user holds which asset, who authorized it, when it was assigned, and if there are pending transfers between employees.

---

## Fields & Data Types

| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Yes | Auto-generated | MongoDB standard unique identifier |
| `assetId` | ObjectId | Yes | None | References `_id` in `assets` collection |
| `employeeId` | ObjectId | Yes | None | References `_id` in `users` collection (the assignee) |
| `allocatedById` | ObjectId | Yes | None | References `_id` in `users` collection (admin or manager who assigned it) |
| `allocatedDate` | Date | Yes | `Date.now` | UTC timestamp of allocation |
| `expectedReturnDate` | Date | No | null | Optional expected return date |
| `actualReturnDate` | Date | No | null | Filled when the asset is physically returned |
| `status` | String | Yes | `ACTIVE` | Enum: `ACTIVE`, `RETURNED`, `TRANSFERRED` |
| `transferStatus` | String | Yes | `NONE` | Enum: `NONE`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED` |
| `transferRequestedTo` | ObjectId | No | null | References `_id` in `users` collection (the proposed new assignee) |
| `notes` | String | No | null | Optional comments or details |
| `createdAt` | Date | Yes | `Date.now` | UTC timestamp of record creation |
| `updatedAt` | Date | Yes | `Date.now` | UTC timestamp of last record update |

---

## Relationships
- **assetId**: Links to the `assets` collection (`_id`).
- **employeeId**: Links to the `users` collection (`_id`).
- **allocatedById**: Links to the `users` collection (`_id`).
- **transferRequestedTo**: Links to the `users` collection (`_id`).

---

## Indexes

| Index Name | Index Key(s) | Type | Unique | Filter Expression (Partial Index) | Purpose |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `idx_allocations_assetId` | `{ assetId: 1 }` | B-tree | No | None | Lookup allocations for a specific asset |
| `idx_allocations_employeeId` | `{ employeeId: 1 }` | B-tree | No | None | Lookup active/historic assets of an employee |
| `idx_allocations_active_unique` | `{ assetId: 1 }` | B-tree | Yes | `{ status: "ACTIVE" }` | **Critical**: Prevents double allocation of the same asset |
| `idx_allocations_transferStatus` | `{ transferStatus: 1 }` | B-tree | No | None | Listing pending transfers for manager approval |

---

## Business Rules
1. **No Double Allocation**: An asset can only have ONE `ACTIVE` allocation at any point. This is enforced at the DB level by the unique partial index `idx_allocations_active_unique` on `assetId` where `status: "ACTIVE"`.
2. **Asset State Management**:
   - Creating an `ACTIVE` allocation changes the referenced asset's status to `ALLOCATED`.
   - Recording an `actualReturnDate` (which sets status to `RETURNED`) resets the asset's status to `AVAILABLE`.
3. **Transfer Lifecycle**:
   - An employee or department head initiates a transfer request, setting `transferStatus` to `PENDING_APPROVAL` and defining `transferRequestedTo`.
   - If `transferStatus` is set to `APPROVED`, the current allocation status changes to `TRANSFERRED`, and a new `ACTIVE` allocation is automatically created for the recipient (`transferRequestedTo`).
   - If set to `REJECTED`, the allocation status remains `ACTIVE`, and `transferStatus` resets to `NONE`.

---

## Example Document
```json
{
  "_id": { "$oid": "64b0f3e8c1e2f7b8a5d4e004" },
  "assetId": { "$oid": "64b0f3e8c1e2f7b8a5d4e301" },
  "employeeId": { "$oid": "64b0f3e8c1e2f7b8a5d4e104" },
  "allocatedById": { "$oid": "64b0f3e8c1e2f7b8a5d4e103" },
  "allocatedDate": { "$date": "2026-07-12T04:10:00.000Z" },
  "expectedReturnDate": { "$date": "2027-07-12T00:00:00.000Z" },
  "actualReturnDate": null,
  "status": "ACTIVE",
  "transferStatus": "NONE",
  "transferRequestedTo": null,
  "notes": "Standard developer setup",
  "createdAt": { "$date": "2026-07-12T04:10:00.000Z" },
  "updatedAt": { "$date": "2026-07-12T04:10:00.000Z" }
}
```
