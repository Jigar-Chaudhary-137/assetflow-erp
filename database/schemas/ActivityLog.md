# Schema: Activity Log

## Collection Purpose
The `activitylogs` collection records an immutable audit log of administrative and transactional events in the system. It tracks user sessions, configuration modifications, asset status changes, allocation updates, and general user actions for compliance, security, and troubleshooting.

---

## Fields & Data Types

| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Yes | Auto-generated | MongoDB standard unique identifier |
| `userId` | ObjectId | Yes | None | References `_id` in `users` collection. Represents the initiator |
| `action` | String | Yes | None | Trimmed, standard action verbs (e.g., `LOGIN`, `CREATE`, `UPDATE`, `DELETE`, `APPROVE`, `TRANSFER`, `CLOSE`) |
| `module` | String | Yes | None | Enum: `AUTH`, `USER`, `DEPARTMENT`, `CATEGORY`, `ASSET`, `ALLOCATION`, `BOOKING`, `MAINTENANCE`, `AUDIT` |
| `description` | String | Yes | None | Trimmed, human-readable summary of the operation performed |
| `ipAddress` | String | No | null | IP address of the user agent initiating the request |
| `userAgent` | String | No | null | Browser/Client user agent string |
| `metadata` | Object | No | null | Optional structured key-value object capturing affected IDs, old vs. new values, or specific error codes |
| `timestamp` | Date | Yes | `Date.now` | UTC timestamp when the action occurred |

---

## Relationships
- **userId**: Links to the `users` collection (`_id`).

---

## Indexes

| Index Name | Index Key(s) | Type | Unique | Purpose |
| :--- | :--- | :--- | :---: | :--- |
| `idx_activitylogs_userId` | `{ userId: 1 }` | B-tree | No | Tracking actions performed by a specific user |
| `idx_activitylogs_module` | `{ module: 1 }` | B-tree | No | Filtering log entries by functional area |
| `idx_activitylogs_timestamp` | `{ timestamp: -1 }` | B-tree | No | Fast chronological loading of system activity feeds |

---

## Business Rules
1. **Immutability Constraint**: The `activitylogs` collection is strictly append-only. Documents inside this collection must not be modified or deleted by any user role (including Admins).
2. **Global Integration**: Every key mutation in the database (such as creating assets, approving transfers, assigning bookings, starting audits, and changing user privileges) must programmatically append a corresponding log record in this collection.

---

## Example Document
```json
{
  "_id": { "$oid": "64b0f3e8c1e2f7b8a5d4e010" },
  "userId": { "$oid": "64b0f3e8c1e2f7b8a5d4e103" },
  "action": "APPROVE",
  "module": "MAINTENANCE",
  "description": "Approved maintenance work order request for asset tag AST-LAP-0001.",
  "ipAddress": "192.168.1.55",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
  "metadata": {
    "maintenanceId": "64b0f3e8c1e2f7b8a5d4e501",
    "assetTag": "AST-LAP-0001",
    "previousStatus": "PENDING",
    "newStatus": "APPROVED"
  },
  "timestamp": { "$date": "2026-07-12T04:30:00.000Z" }
}
```
