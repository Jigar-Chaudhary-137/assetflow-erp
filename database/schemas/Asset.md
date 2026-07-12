# Schema: Asset

## Collection Purpose
The `assets` collection stores records for all registered enterprise assets. It details the asset's name, serial number, tag, category reference, status, physical condition, department, location, specifications (matching the category's dynamic schema), purchase details, and a quick history log of transitions.

---

## Fields & Data Types

| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Yes | Auto-generated | MongoDB standard unique identifier |
| `assetTag` | String | Yes | None | Unique, trimmed, alphanumeric, uppercase, matches pattern (e.g., `AST-LAP-\d{4}`) |
| `serialNumber` | String | Yes | None | Unique, trimmed, 3 to 100 characters |
| `name` | String | Yes | None | Trimmed, 2 to 100 characters |
| `categoryId` | ObjectId | Yes | None | References `_id` in `categories` collection |
| `condition` | String | Yes | `NEW` | Enum: `NEW`, `GOOD`, `FAIR`, `POOR`, `DAMAGED` |
| `location` | Object | Yes | None | Embedded sub-document defining physical address (see structure below) |
| `departmentId` | ObjectId | No | null | References `_id` in `departments` collection (owning department) |
| `status` | String | Yes | `AVAILABLE` | Enum: `AVAILABLE`, `ALLOCATED`, `RESERVED`, `UNDER_MAINTENANCE`, `LOST`, `RETIRED`, `DISPOSED` |
| `bookable` | Boolean | Yes | `false` | True if the asset is a shared resource that can be booked via time slots |
| `specs` | Map/Object | No | `{}` | Key-value pairs representing custom category specifications (validated programmatically) |
| `purchaseInfo` | Object | No | null | Embedded purchase details (see structure below) |
| `history` | Array | Yes | `[]` | Embedded list of historical actions (see structure below) |
| `createdAt` | Date | Yes | `Date.now` | UTC timestamp of registration |
| `updatedAt` | Date | Yes | `Date.now` | UTC timestamp of last modification |

### `location` Sub-document Structure
| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `building` | String | Yes | None | Building name/identifier (e.g., "HQ East") |
| `floor` | Number | No | null | Floor number |
| `room` | String | Yes | None | Room name/number (e.g., "Conference Room B") |

### `purchaseInfo` Sub-document Structure
| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `purchaseDate` | Date | No | null | Date of purchase |
| `purchaseCost` | Number | No | null | Positive number representing acquisition value |
| `vendor` | String | No | null | Name of the supplier/seller |
| `warrantyExpiration` | Date | No | null | Date warranty expires |

### `history` Sub-document Structure
| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `date` | Date | Yes | `Date.now` | UTC timestamp when the action occurred |
| `action` | String | Yes | None | Enum: `REGISTERED`, `ALLOCATED`, `RETURNED`, `TRANSFERRED`, `MAINTENANCE_REQUESTED`, `MAINTENANCE_COMPLETED`, `LOST_REPORTED`, `STATUS_CHANGED` |
| `performedById` | ObjectId | Yes | None | References `_id` in `users` collection |
| `details` | String | No | null | Description of the action / notes |

---

## Relationships
- **categoryId**: Links to the `categories` collection (`_id`).
- **departmentId**: Links to the `departments` collection (`_id`).
- **history.performedById**: Links to the `users` collection (`_id`).

---

## Indexes

| Index Name | Index Key(s) | Type | Unique | Purpose |
| :--- | :--- | :--- | :---: | :--- |
| `idx_assets_assetTag` | `{ assetTag: 1 }` | B-tree | Yes | Rapid scanning by unique asset tag |
| `idx_assets_serialNumber` | `{ serialNumber: 1 }` | B-tree | Yes | Rapid lookup by serial number |
| `idx_assets_categoryId` | `{ categoryId: 1 }` | B-tree | No | Finding assets under a category |
| `idx_assets_departmentId` | `{ departmentId: 1 }` | B-tree | No | Finding assets owned by a department |
| `idx_assets_status` | `{ status: 1 }` | B-tree | No | Filtering assets by availability or lifecycle |
| `idx_assets_bookable` | `{ bookable: 1 }` | B-tree | No | Finding bookable resources |

---

## Business Rules
1. **Status Lifecycle Transitions**:
   - `AVAILABLE` -> `ALLOCATED` (via Allocation process)
   - `ALLOCATED` -> `AVAILABLE` (via Return process)
   - `AVAILABLE` -> `RESERVED` (via Booking process)
   - `RESERVED` -> `ALLOCATED` (when picked up / checked out)
   - `AVAILABLE` / `ALLOCATED` -> `UNDER_MAINTENANCE` (via approved maintenance request)
   - `UNDER_MAINTENANCE` -> `AVAILABLE` (upon resolution)
   - Any status -> `LOST` (if missing in audit or reported lost)
   - Any status -> `RETIRED` / `DISPOSED` (end of life)
2. **Allocation Exclusivity**: An asset with status `ALLOCATED`, `UNDER_MAINTENANCE`, `LOST`, `RETIRED`, or `DISPOSED` cannot be assigned to another employee.
3. **Spec Validation**: Custom fields in the `specs` object must conform to the target category's definitions (e.g. if `processor` is required in the Category, it must be present in the Asset's `specs`).

---

## Example Document
```json
{
  "_id": { "$oid": "64b0f3e8c1e2f7b8a5d4e301" },
  "assetTag": "AST-LAP-0001",
  "serialNumber": "MBP2026X901",
  "name": "Developer Macbook Pro",
  "categoryId": { "$oid": "64b0f3e8c1e2f7b8a5d4e201" },
  "condition": "NEW",
  "location": {
    "building": "HQ West",
    "floor": 3,
    "room": "Room 304"
  },
  "departmentId": { "$oid": "64b0f3e8c1e2f7b8a5d4e001" },
  "status": "AVAILABLE",
  "bookable": false,
  "specs": {
    "processor": "Apple M2 Pro",
    "ramSize": 32,
    "storageSize": 512
  },
  "purchaseInfo": {
    "purchaseDate": { "$date": "2026-06-01T00:00:00.000Z" },
    "purchaseCost": 2499.00,
    "vendor": "Apple Inc.",
    "warrantyExpiration": { "$date": "2027-06-01T00:00:00.000Z" }
  },
  "history": [
    {
      "date": { "$date": "2026-06-02T09:00:00.000Z" },
      "action": "REGISTERED",
      "performedById": { "$oid": "64b0f3e8c1e2f7b8a5d4e101" },
      "details": "Asset registered into system inventory."
    }
  ],
  "createdAt": { "$date": "2026-06-02T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-06-02T09:00:00.000Z" }
}
```
