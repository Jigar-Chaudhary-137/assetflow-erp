# Enum: Priority

## Purpose
Defines the urgency levels for maintenance requests in the `maintenances` collection (`priority` field). Priority is set by the reporter at the time of submission and helps `ASSET_MANAGER` and `DEPARTMENT_HEAD` users triage and schedule repair work efficiently.

---

## Allowed Values

| Value | Description | SLA Expectation |
| :--- | :--- | :--- |
| `LOW` | Minor issue; asset is still usable. | Resolve within 2 weeks |
| `MEDIUM` | Moderate issue affecting productivity. | Resolve within 1 week |
| `HIGH` | Significant issue preventing normal use. | Resolve within 48 hours |
| `CRITICAL` | Asset is non-functional or poses a risk. | Resolve within 24 hours |

---

## Usage

### Mongoose Model
```js
// Maintenance.js
priority: {
  type: String,
  enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  default: 'LOW',
  required: true,
}
```

### Backend — Priority Filtering
```js
// Get all high-priority and critical open requests
const urgentRequests = await Maintenance.find({
  priority: { $in: ['HIGH', 'CRITICAL'] },
  status:   { $in: ['PENDING', 'APPROVED'] },
});
```

### Frontend — Priority Badge Colors
```js
const priorityColors = {
  LOW:      'gray',
  MEDIUM:   'blue',
  HIGH:     'orange',
  CRITICAL: 'red',
};
```

### Frontend — Priority Sort Order
```js
const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
requests.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
```

---

## Rules
1. Priority is set by the submitter (`EMPLOYEE`, `DEPARTMENT_HEAD`, or `ASSET_MANAGER`) at the time of creating the maintenance request.
2. Priority can be updated by `ASSET_MANAGER` before the request is approved.
3. Priority does not automatically change the maintenance workflow — it is a sorting and filtering aid only.
