# Enum: Notification Type

## Purpose
Defines all categories of system-generated notifications stored in the `notifications` collection (`type` field). Notifications are created automatically as side effects of key transactions (allocations, bookings, maintenance, transfers, and audits) and are never created manually by users.

---

## Allowed Values

| Value | Description | Triggered By |
| :--- | :--- | :--- |
| `ALLOCATION` | An asset has been allocated to an employee. | Creating an `allocations` record |
| `TRANSFER_REQUEST` | An asset transfer has been requested. | Setting `transferStatus: PENDING_APPROVAL` on an allocation |
| `MAINTENANCE_ALERT` | A maintenance request status has changed. | Any update to a `maintenances` record status |
| `BOOKING_CONFIRMATION` | A booking has been created or cancelled. | Creating or cancelling a `bookings` record |
| `AUDIT_ALERT` | An audit cycle has been started or an asset has been flagged. | Audit status change or asset added to `missingAssets` / `damagedAssets` |
| `SYSTEM` | A general system-level message (e.g., password reset, account changes). | System-level events |

---

## Usage

### Mongoose Model
```js
// Notification.js
type: {
  type: String,
  enum: ['ALLOCATION', 'TRANSFER_REQUEST', 'MAINTENANCE_ALERT', 'BOOKING_CONFIRMATION', 'AUDIT_ALERT', 'SYSTEM'],
  default: 'SYSTEM',
  required: true,
}
```

### Backend — Creating a Notification
```js
// Utility function
const createNotification = async ({ receiverId, type, title, message, relatedEntityId, relatedEntityType }) => {
  await Notification.create({
    receiverId,
    type,
    title,
    message,
    relatedEntityId,
    relatedEntityType,
    readStatus: false,
  });
};

// Example: After creating an allocation
await createNotification({
  receiverId: allocation.employeeId,
  type:       'ALLOCATION',
  title:      'New Asset Assigned',
  message:    `You have been allocated asset ${asset.assetTag}.`,
  relatedEntityId:   allocation._id,
  relatedEntityType: 'Allocation',
});
```

### Frontend — Notification Icon Mapping
```js
const notificationIcons = {
  ALLOCATION:           '📦',
  TRANSFER_REQUEST:     '🔄',
  MAINTENANCE_ALERT:    '🔧',
  BOOKING_CONFIRMATION: '📅',
  AUDIT_ALERT:          '🔍',
  SYSTEM:               '🔔',
};
```

---

## Rules
1. Notifications are **system-generated only** — no API endpoint should allow direct creation by a user.
2. The `receiverId` must reference a valid, `ACTIVE` user.
3. Only the `readStatus` field may be updated after creation — all other fields are immutable.
4. The `relatedEntityType` must be one of: `Asset`, `Allocation`, `Booking`, `Maintenance`, `Audit`.
