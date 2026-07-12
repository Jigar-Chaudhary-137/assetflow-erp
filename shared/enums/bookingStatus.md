# Enum: Booking Status

## Purpose
Defines all possible states for a booking record in the `bookings` collection (`status` field). A booking represents a short-term time-slot reservation of a shared, bookable asset (e.g., conference rooms). The system automatically transitions bookings between states based on scheduled times and user actions.

---

## Allowed Values

| Value | Description |
| :--- | :--- |
| `UPCOMING` | Booking has been confirmed and the slot is in the future. Asset status is `RESERVED`. |
| `ONGOING` | Booking start time has been reached. The reserved asset is actively in use. |
| `COMPLETED` | Booking slot has ended. Asset status reverts to `AVAILABLE`. |
| `CANCELLED` | Booking was cancelled before it started. Asset status reverts to `AVAILABLE`. |

---

## Lifecycle Transitions

```
        CREATE
          │
          ▼
       UPCOMING ──────────► CANCELLED
          │
          ▼ (at startTime)
       ONGOING
          │
          ▼ (at endTime)
       COMPLETED
```

---

## Usage

### Mongoose Model
```js
// Booking.js
status: {
  type: String,
  enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
  default: 'UPCOMING',
  required: true,
}
```

### Backend — Scheduled Transition (Cron Job / Scheduled Function)
```js
// Move UPCOMING bookings to ONGOING when startTime is reached
await Booking.updateMany(
  { status: 'UPCOMING', startTime: { $lte: new Date() } },
  { $set: { status: 'ONGOING' } }
);

// Move ONGOING bookings to COMPLETED when endTime is reached
await Booking.updateMany(
  { status: 'ONGOING', endTime: { $lte: new Date() } },
  { $set: { status: 'COMPLETED' } }
);
```

### Frontend — Status Badge Colors
```js
const bookingStatusColors = {
  UPCOMING:  'blue',
  ONGOING:   'green',
  COMPLETED: 'gray',
  CANCELLED: 'red',
};
```

---

## Rules
1. Only bookings with status `UPCOMING` can be **cancelled**.
2. Only `UPCOMING` and `ONGOING` bookings participate in the **overlap validation** check.
3. Cancelling or completing a booking must revert the associated asset's status to `AVAILABLE`.
4. A booking's `startTime` must always be in the future at the time of creation.
5. `COMPLETED` and `CANCELLED` bookings are read-only — they cannot be modified.
