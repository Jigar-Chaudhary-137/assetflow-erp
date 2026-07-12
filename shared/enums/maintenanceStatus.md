# Enum: Maintenance Status

## Purpose
Defines the complete workflow states for a maintenance record in the `maintenances` collection (`status` field). Maintenance requests follow a structured approval and execution workflow. Each status transition reflects an action taken by a specific role in the system.

---

## Allowed Values

| Value | Description | Who Sets It |
| :--- | :--- | :--- |
| `PENDING` | Request has been submitted and is awaiting review. | System (on creation) |
| `APPROVED` | Request has been reviewed and approved. Asset is locked. | `ASSET_MANAGER` or `DEPARTMENT_HEAD` |
| `REJECTED` | Request was reviewed and denied. Asset remains unchanged. | `ASSET_MANAGER` or `DEPARTMENT_HEAD` |
| `TECHNICIAN_ASSIGNED` | An employee has been assigned to perform the maintenance work. | `ASSET_MANAGER` |
| `IN_PROGRESS` | Maintenance work has actively started. | `ASSET_MANAGER` or assigned employee |
| `RESOLVED` | Work is complete. Asset condition updated and returned to `AVAILABLE`. | `ASSET_MANAGER` or assigned employee |

---

## Lifecycle Transitions

```
       CREATE
          │
          ▼
       PENDING
       /     \
      ▼       ▼
  APPROVED  REJECTED
      │
      ▼
TECHNICIAN_ASSIGNED
      │
      ▼
  IN_PROGRESS
      │
      ▼
   RESOLVED
```

---

## Asset Status Impact

| Maintenance Status | Asset Status |
| :--- | :--- |
| `PENDING` | Unchanged (e.g. `AVAILABLE` or `ALLOCATED`) |
| `APPROVED` | `UNDER_MAINTENANCE` |
| `TECHNICIAN_ASSIGNED` | `UNDER_MAINTENANCE` |
| `IN_PROGRESS` | `UNDER_MAINTENANCE` |
| `RESOLVED` | `AVAILABLE` |
| `REJECTED` | Unchanged (reverts to pre-request state) |

---

## Usage

### Mongoose Model
```js
// Maintenance.js
status: {
  type: String,
  enum: ['PENDING', 'APPROVED', 'REJECTED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED'],
  default: 'PENDING',
  required: true,
}
```

### Backend — Approval Hook
```js
// When maintenance is approved, lock the asset
if (newStatus === 'APPROVED') {
  await Asset.findByIdAndUpdate(maintenance.assetId, { status: 'UNDER_MAINTENANCE' });
  maintenance.approvedById = req.user._id;
  maintenance.approvalDate = new Date();
}

// When maintenance is resolved, release the asset
if (newStatus === 'RESOLVED') {
  await Asset.findByIdAndUpdate(maintenance.assetId, { status: 'AVAILABLE' });
  maintenance.completionDate = new Date();
}
```

### Frontend — Status Badge Colors
```js
const maintenanceStatusColors = {
  PENDING:             'yellow',
  APPROVED:            'blue',
  REJECTED:            'red',
  TECHNICIAN_ASSIGNED: 'purple',
  IN_PROGRESS:         'orange',
  RESOLVED:            'green',
};
```

---

## Rules
1. All maintenance requests begin with status `PENDING`.
2. Only `ASSET_MANAGER` or `DEPARTMENT_HEAD` can set `APPROVED` or `REJECTED`.
3. `technicianId` (a reference to a `users` document) **must** be populated when status is set to `TECHNICIAN_ASSIGNED`. The technician is a standard employee, not a separate role.
4. `RESOLVED` status must populate `completionDate`, `resolutionDetails`, and `cost`.
5. A `REJECTED` maintenance request must not change the asset's status.
