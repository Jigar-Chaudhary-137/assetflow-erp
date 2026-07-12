# Schema: Audit

## Collection Purpose
The `audits` collection records organizational inventory verification cycles. It tracks scheduled audits, who is conducting the audits (Auditors), and splits audited items into lists of verified, missing, or damaged assets to update the main asset registry.

---

## Fields & Data Types

| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Yes | Auto-generated | MongoDB standard unique identifier |
| `auditCycleName` | String | Yes | None | Trimmed, 3 to 100 characters (e.g. "Q3 2026 Laptop Audit") |
| `auditorId` | ObjectId | Yes | None | References `_id` in `users` collection. Must be Admin or Asset Manager |
| `status` | String | Yes | `PLANNED` | Enum: `PLANNED`, `ACTIVE`, `COMPLETED`, `CLOSED` |
| `startDate` | Date | Yes | None | Date the audit cycle officially begins |
| `endDate` | Date | No | null | Date the audit cycle is finalized and closed |
| `targetDepartmentId` | ObjectId | No | null | References `_id` in `departments`. Restricts scope to a department |
| `targetCategoryId` | ObjectId | No | null | References `_id` in `categories`. Restricts scope to a category |
| `verifiedAssets` | Array | Yes | `[]` | List of items successfully verified (see sub-document structure) |
| `missingAssets` | Array | Yes | `[]` | List of items not found during the audit (see sub-document structure) |
| `damagedAssets` | Array | Yes | `[]` | List of items found with physical damage (see sub-document structure) |
| `createdAt` | Date | Yes | `Date.now` | UTC timestamp of record creation |
| `updatedAt` | Date | Yes | `Date.now` | UTC timestamp of last modification |

### `verifiedAssets` Sub-document Structure
| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `assetId` | ObjectId | Yes | None | References `_id` in `assets` |
| `verifiedAt` | Date | Yes | `Date.now` | UTC timestamp of verification |
| `verifiedCondition` | String | Yes | None | Enum: `NEW`, `GOOD`, `FAIR`, `POOR`, `DAMAGED` |
| `verifiedLocation` | Object | Yes | None | Embedded `location` schema (building, floor, room) |
| `notes` | String | No | null | Remarks by auditor |

### `missingAssets` Sub-document Structure
| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `assetId` | ObjectId | Yes | None | References `_id` in `assets` |
| `reportedAt` | Date | Yes | `Date.now` | UTC timestamp of report |
| `notes` | String | No | null | Remarks on search efforts or last seen details |

### `damagedAssets` Sub-document Structure
| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `assetId` | ObjectId | Yes | None | References `_id` in `assets` |
| `reportedAt` | Date | Yes | `Date.now` | UTC timestamp of report |
| `damageDescription` | String | Yes | None | Trimmed, 5 to 500 characters describing physical defects |
| `notes` | String | No | null | Additional comments |

---

## Relationships
- **auditorId**: Links to the `users` collection (`_id`).
- **targetDepartmentId**: Links to the `departments` collection (`_id`).
- **targetCategoryId**: Links to the `categories` collection (`_id`).
- **verifiedAssets.assetId / missingAssets.assetId / damagedAssets.assetId**: Links to the `assets` collection (`_id`).

---

## Indexes

| Index Name | Index Key(s) | Type | Unique | Purpose |
| :--- | :--- | :--- | :---: | :--- |
| `idx_audits_auditorId` | `{ auditorId: 1 }` | B-tree | No | Finding audit cycles assigned to an auditor |
| `idx_audits_status` | `{ status: 1 }` | B-tree | No | Filtering active or planned audits |
| `idx_audits_startDate` | `{ startDate: -1 }` | B-tree | No | Ordering audits chronologically |

---

## Business Rules
1. **Auditor Permission**: The `auditorId` user must hold the role `ADMIN` or `ASSET_MANAGER`.
2. **Audit Action Cascades**:
   - Marking an asset in `missingAssets` must automatically trigger a status change on that asset to `LOST`.
   - Marking an asset in `damagedAssets` must automatically:
     1. Change that asset's status to `UNDER_MAINTENANCE` (or flag it for checkup).
     2. Create a new `PENDING` maintenance work order request.
   - For `verifiedAssets`, if the condition or location differs from the active registry record, the corresponding fields in the `assets` collection must be updated to match the verified data.
3. **Closure Lock**: Once the status of the audit cycle is updated to `CLOSED`, the arrays (`verifiedAssets`, `missingAssets`, `damagedAssets`) become read-only to guarantee historical data integrity.

---

## Example Document
```json
{
  "_id": { "$oid": "64b0f3e8c1e2f7b8a5d4e601" },
  "auditCycleName": "Q3 2026 Annual Asset Audit",
  "auditorId": { "$oid": "64b0f3e8c1e2f7b8a5d4e102" },
  "status": "ACTIVE",
  "startDate": { "$date": "2026-07-01T00:00:00.000Z" },
  "endDate": null,
  "targetDepartmentId": { "$oid": "64b0f3e8c1e2f7b8a5d4e001" },
  "targetCategoryId": null,
  "verifiedAssets": [
    {
      "assetId": { "$oid": "64b0f3e8c1e2f7b8a5d4e301" },
      "verifiedAt": { "$date": "2026-07-12T05:00:00.000Z" },
      "verifiedCondition": "GOOD",
      "verifiedLocation": {
        "building": "HQ West",
        "floor": 3,
        "room": "Room 304"
      },
      "notes": "Verified in person, in excellent shape."
    }
  ],
  "missingAssets": [],
  "damagedAssets": []
}
```
