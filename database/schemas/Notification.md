# Schema: Notification

## Collection Purpose
The `notifications` collection logs system-generated alerts, approvals, and reminders dispatched to users when important actions occur in the ERP system (such as asset allocations, booking confirmations, transfer requests, maintenance alerts, and audit tasks).

---

## Fields & Data Types

| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Yes | Auto-generated | MongoDB standard unique identifier |
| `receiverId` | ObjectId | Yes | None | References `_id` in `users` collection |
| `type` | String | Yes | `SYSTEM` | Enum: `ALLOCATION`, `TRANSFER_REQUEST`, `MAINTENANCE_ALERT`, `BOOKING_CONFIRMATION`, `AUDIT_ALERT`, `SYSTEM` |
| `title` | String | Yes | None | Trimmed, short descriptive header, 3 to 100 characters |
| `message` | String | Yes | None | Trimmed, detailed notification body text |
| `readStatus` | Boolean | Yes | `false` | True if the notification has been marked as read by the receiver |
| `relatedEntityId` | ObjectId | No | null | References `_id` of the document triggering this alert |
| `relatedEntityType` | String | No | null | Enum: `Asset`, `Allocation`, `Booking`, `Maintenance`, `Audit` |
| `createdAt` | Date | Yes | `Date.now` | UTC timestamp when notification was issued |

---

## Relationships
- **receiverId**: Links to the `users` collection (`_id`).
- **relatedEntityId**: Polymorphic reference to another collection, dynamically matching the collection type listed in `relatedEntityType`.

---

## Indexes

| Index Name | Index Key(s) | Type | Unique | Purpose |
| :--- | :--- | :--- | :---: | :--- |
| `idx_notifications_receiver_unread` | `{ receiverId: 1, readStatus: 1 }` | Compound | No | Speeds up loading unread alert badges for active users |
| `idx_notifications_receiver_time` | `{ receiverId: 1, createdAt: -1 }` | Compound | No | Loads user notification feeds sorted from newest to oldest |

---

## Business Rules
1. **Trigger Automated Creation**: Notifications must be created automatically through backend database middleware hooks on actions:
   - *Allocation*: When an asset allocation is registered, a notification is sent to the target `employeeId`.
   - *Transfer Request*: When a transfer is requested, a notification is sent to the target department manager or administrator.
   - *Maintenance*: When a maintenance request status updates, a notification is sent to the reporter and/or the technician.
   - *Booking*: When a booking is confirmed, a notification is sent to the `employeeId` who made it.
2. **Immutable Except Status**: All fields on notifications are read-only (immutable) upon generation, with the sole exception of `readStatus`, which can be toggled between `true` and `false` by the receiver.

---

## Example Document
```json
{
  "_id": { "$oid": "64b0f3e8c1e2f7b8a5d4e009" },
  "receiverId": { "$oid": "64b0f3e8c1e2f7b8a5d4e104" },
  "type": "ALLOCATION",
  "title": "New Asset Assigned",
  "message": "You have been allocated the asset 'AST-LAP-0001' (Macbook Pro). Please review and accept the transfer.",
  "readStatus": false,
  "relatedEntityId": { "$oid": "64b0f3e8c1e2f7b8a5d4e004" },
  "relatedEntityType": "Allocation",
  "createdAt": { "$date": "2026-07-12T04:10:00.000Z" }
}
```
