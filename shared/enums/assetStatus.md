# Enum: Asset Status

## Purpose
Defines all possible lifecycle states an asset can occupy in the `assets` collection (`status` field). Status transitions are triggered automatically by backend operations on the `allocations`, `bookings`, `maintenances`, and `audits` collections. No status value should ever be set arbitrarily — each must result from a defined workflow action.

---

## Allowed Values

| Value | Description | Terminal? |
| :--- | :--- | :---: |
| `AVAILABLE` | Asset is in inventory and ready to be allocated, reserved, or booked. | No |
| `ALLOCATED` | Asset has been assigned to an employee via an active allocation record. | No |
| `RESERVED` | Asset has been reserved for an upcoming booking slot. | No |
| `UNDER_MAINTENANCE` | Asset is undergoing repair. Locked from allocation and booking. | No |
| `LOST` | Asset was reported missing (typically during an audit). Administrative state. | Yes |
| `RETIRED` | Asset has reached end-of-life and has been formally retired. | Yes |
| `DISPOSED` | Asset has been physically disposed of or written off. | Yes |

---

## Lifecycle Transitions

```
AVAILABLE ──────────────────┐
    │                       │
    ▼                       ▼
ALLOCATED            UNDER_MAINTENANCE
    │                       │
    ▼                       ▼
(Return)              (Resolved)
    │                       │
    └───────► AVAILABLE ◄───┘

AVAILABLE ──► RESERVED ──► ALLOCATED

Any State ──► LOST        (audit / manual report)
Any State ──► RETIRED     (manager action)
Any State ──► DISPOSED    (manager action)
```

---

## Usage

### Mongoose Model
```js
// Asset.js
status: {
  type: String,
  enum: ['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED'],
  default: 'AVAILABLE',
  required: true,
}
```

### Backend — Status Transition Example
```js
// When an allocation is created:
await Asset.findByIdAndUpdate(assetId, { status: 'ALLOCATED' });

// When a booking begins:
await Asset.findByIdAndUpdate(assetId, { status: 'RESERVED' });

// When maintenance is approved:
await Asset.findByIdAndUpdate(assetId, { status: 'UNDER_MAINTENANCE' });

// When maintenance is resolved:
await Asset.findByIdAndUpdate(assetId, { status: 'AVAILABLE' });
```

### Frontend — Status Badge Colors
```js
const statusColors = {
  AVAILABLE:         'green',
  ALLOCATED:         'blue',
  RESERVED:          'yellow',
  UNDER_MAINTENANCE: 'orange',
  LOST:              'red',
  RETIRED:           'gray',
  DISPOSED:          'gray',
};
```

---

## Rules
1. Only `AVAILABLE` assets can be allocated, reserved, or booked.
2. `ALLOCATED` and `UNDER_MAINTENANCE` assets cannot be assigned to another employee.
3. `LOST`, `RETIRED`, and `DISPOSED` are **terminal states** — no standard workflow transitions out of them.
4. Status must never be updated directly via a PATCH on assets — it must be updated as a side effect of the relevant transactional operation (allocation, booking, maintenance, audit).
