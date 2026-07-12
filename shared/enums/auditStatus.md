# Enum: Audit Status

## Purpose
Defines the lifecycle states for an audit cycle record in the `audits` collection (`status` field). An audit cycle is an organizational inventory verification exercise that scans assets within a department or category scope and categorizes them as verified, missing, or damaged.

---

## Allowed Values

| Value | Description |
| :--- | :--- |
| `PLANNED` | Audit cycle has been scheduled but has not yet started. |
| `ACTIVE` | Audit is currently in progress. Auditors are verifying assets. |
| `COMPLETED` | All assets within scope have been reviewed. Awaiting formal closure. |
| `CLOSED` | Audit cycle has been formally closed. All arrays are immutable. |

---

## Lifecycle Transitions

```
   CREATE
      │
      ▼
   PLANNED
      │
      ▼
   ACTIVE
      │
      ▼
  COMPLETED
      │
      ▼
   CLOSED
```

---

## Usage

### Mongoose Model
```js
// Audit.js
status: {
  type: String,
  enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'CLOSED'],
  default: 'PLANNED',
  required: true,
}
```

### Backend — Closure Lock
```js
// Prevent modification of asset arrays after audit is CLOSED
auditSchema.pre('save', function (next) {
  if (this.isModified('verifiedAssets') ||
      this.isModified('missingAssets') ||
      this.isModified('damagedAssets')) {
    const original = this._original;
    if (original && original.status === 'CLOSED') {
      return next(new Error('Cannot modify a closed audit cycle.'));
    }
  }
  next();
});
```

### Frontend — Status Badge Colors
```js
const auditStatusColors = {
  PLANNED:   'blue',
  ACTIVE:    'yellow',
  COMPLETED: 'green',
  CLOSED:    'gray',
};
```

---

## Rules
1. Only `ADMIN` or `ASSET_MANAGER` can create or manage audit cycles.
2. Transitions must be strictly sequential — `PLANNED` → `ACTIVE` → `COMPLETED` → `CLOSED`.
3. Once an audit reaches `CLOSED`, its `verifiedAssets`, `missingAssets`, and `damagedAssets` arrays become **read-only**.
4. Assets found in `missingAssets` during an `ACTIVE` audit must have their status updated to `LOST`.
5. Assets found in `damagedAssets` must have their status set to `UNDER_MAINTENANCE` and trigger a new `PENDING` maintenance record.
