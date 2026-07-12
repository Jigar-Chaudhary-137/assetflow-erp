# Enum: Roles

## Purpose
Defines the four user roles in the AssetFlow system. Every `users` document must carry exactly one of these values in its `role` field. All permission checks, route guards, and conditional UI rendering are driven exclusively by this enum.

---

## Allowed Values

| Value | Description |
| :--- | :--- |
| `ADMIN` | Full system access. Manages users, departments, categories, assets, and system configuration. |
| `ASSET_MANAGER` | Manages asset lifecycle — registration, allocation, transfers, maintenance approvals, and audits. |
| `DEPARTMENT_HEAD` | Manages resources within their assigned department. Approves departmental transfers, raises requests. |
| `EMPLOYEE` | Standard end-user. Can view assigned assets, raise maintenance requests, create bookings, and request transfers. |

---

## Usage

### Mongoose Model
```js
// User.js
role: {
  type: String,
  enum: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
  default: 'EMPLOYEE',
  required: true,
}
```

### Backend — Middleware Guard
```js
// middleware/authorize.js
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
};

// Usage on a route
router.post('/assets', authorize('ADMIN', 'ASSET_MANAGER'), createAsset);
```

### Frontend — Route Guard (React)
```jsx
// Conditional render based on role
{user.role === 'ADMIN' && <AdminPanel />}
{['ADMIN', 'ASSET_MANAGER'].includes(user.role) && <AssetManagement />}
```

---

## Role Hierarchy Summary

```
ADMIN
  └── Full access to all modules
ASSET_MANAGER
  └── Asset, Allocation, Maintenance, Audit, Booking management
DEPARTMENT_HEAD
  └── Department-scoped assets, transfers, bookings
EMPLOYEE
  └── View own assets, create bookings, raise maintenance, request transfers
```

---

## Rules
1. Every user must have exactly **one** role.
2. Roles are stored in the `users` collection — do **not** embed roles in tokens without syncing with the database.
3. A `DEPARTMENT_HEAD` must always have a valid `departmentId` assigned.
4. `ADMIN` and `ASSET_MANAGER` may have `departmentId: null`.
