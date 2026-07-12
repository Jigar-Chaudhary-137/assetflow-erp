# Constants: Permissions

## Purpose
Defines which role is authorized to perform each operation across all AssetFlow modules. This is the single source of truth for backend route-level authorization middleware and frontend conditional rendering of buttons, menus, and pages.

---

## Permission Matrix

### Authentication & User Management

| Operation | ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE |
| :--- | :---: | :---: | :---: | :---: |
| Register new user | ✅ | ❌ | ❌ | ❌ |
| Login | ✅ | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ | ✅ |
| Change own password | ✅ | ✅ | ✅ | ✅ |
| View all users | ✅ | ✅ | ❌ | ❌ |
| Update any user | ✅ | ❌ | ❌ | ❌ |
| Activate / Deactivate user | ✅ | ❌ | ❌ | ❌ |
| Delete user | ✅ | ❌ | ❌ | ❌ |

---

### Departments

| Operation | ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE |
| :--- | :---: | :---: | :---: | :---: |
| View all departments | ✅ | ✅ | ✅ | ✅ |
| Create department | ✅ | ❌ | ❌ | ❌ |
| Update department | ✅ | ❌ | ❌ | ❌ |
| Delete department | ✅ | ❌ | ❌ | ❌ |
| Assign department head | ✅ | ❌ | ❌ | ❌ |

---

### Categories

| Operation | ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE |
| :--- | :---: | :---: | :---: | :---: |
| View all categories | ✅ | ✅ | ✅ | ✅ |
| Create category | ✅ | ✅ | ❌ | ❌ |
| Update category | ✅ | ✅ | ❌ | ❌ |
| Delete category | ✅ | ❌ | ❌ | ❌ |

---

### Assets

| Operation | ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE |
| :--- | :---: | :---: | :---: | :---: |
| View all assets | ✅ | ✅ | ✅ (dept only) | ✅ (own only) |
| View asset details | ✅ | ✅ | ✅ | ✅ |
| Register new asset | ✅ | ✅ | ❌ | ❌ |
| Update asset details | ✅ | ✅ | ❌ | ❌ |
| Delete asset record | ✅ | ❌ | ❌ | ❌ |
| View asset history | ✅ | ✅ | ❌ | ❌ |
| Retire / Dispose asset | ✅ | ✅ | ❌ | ❌ |

---

### Allocations

| Operation | ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE |
| :--- | :---: | :---: | :---: | :---: |
| View all allocations | ✅ | ✅ | ✅ (dept only) | ✅ (own only) |
| Allocate asset to employee | ✅ | ✅ | ❌ | ❌ |
| Return an asset | ✅ | ✅ | ❌ | ❌ |
| Request asset transfer | ✅ | ✅ | ✅ | ✅ |
| Approve transfer | ✅ | ✅ | ✅ (dept) | ❌ |
| Reject transfer | ✅ | ✅ | ✅ (dept) | ❌ |

---

### Bookings

| Operation | ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE |
| :--- | :---: | :---: | :---: | :---: |
| View all bookings | ✅ | ✅ | ✅ (dept only) | ✅ (own only) |
| Create booking | ✅ | ✅ | ✅ | ✅ |
| Cancel own booking | ✅ | ✅ | ✅ | ✅ |
| Cancel any booking | ✅ | ✅ | ❌ | ❌ |

---

### Maintenance

| Operation | ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE |
| :--- | :---: | :---: | :---: | :---: |
| View all requests | ✅ | ✅ | ✅ (dept only) | ✅ (own only) |
| Raise maintenance request | ✅ | ✅ | ✅ | ✅ |
| Approve request | ✅ | ✅ | ✅ | ❌ |
| Reject request | ✅ | ✅ | ✅ | ❌ |
| Assign employee (technician) | ✅ | ✅ | ❌ | ❌ |
| Mark as resolved | ✅ | ✅ | ❌ | ❌ |

---

### Audits

| Operation | ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE |
| :--- | :---: | :---: | :---: | :---: |
| View all audit cycles | ✅ | ✅ | ❌ | ❌ |
| Create audit cycle | ✅ | ✅ | ❌ | ❌ |
| Conduct audit (verify/flag assets) | ✅ | ✅ | ❌ | ❌ |
| Complete audit | ✅ | ✅ | ❌ | ❌ |
| Close audit | ✅ | ✅ | ❌ | ❌ |

---

### Notifications

| Operation | ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE |
| :--- | :---: | :---: | :---: | :---: |
| View own notifications | ✅ | ✅ | ✅ | ✅ |
| Mark as read | ✅ | ✅ | ✅ | ✅ |

---

### Reports

| Operation | ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE |
| :--- | :---: | :---: | :---: | :---: |
| View system-wide reports | ✅ | ✅ | ❌ | ❌ |
| View department report | ✅ | ✅ | ✅ (own dept) | ❌ |

---

## Backend Usage (Middleware)

```js
// middleware/authorize.js
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
  }
  next();
};

// Example router usage
router.post('/',                authorize('ADMIN', 'ASSET_MANAGER'),    createAsset);
router.patch('/:id/approve',   authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), approveMaintenance);
```

---

## Frontend Usage (Conditional Rendering)

```jsx
// hooks/usePermission.js
export const usePermission = (allowedRoles) => {
  const { user } = useAuth();
  return allowedRoles.includes(user?.role);
};

// Component usage
const canRegisterAsset = usePermission(['ADMIN', 'ASSET_MANAGER']);

{canRegisterAsset && <Button>Register Asset</Button>}
```
