# Constants: API Routes

## Purpose
Defines all REST API endpoint paths for the AssetFlow backend. These routes are the canonical reference for both the Express.js backend (route registration) and the React frontend (Axios base URLs). All routes are prefixed with `/api`.

---

## Base URL
```
http://localhost:5000/api         (Development)
https://api.assetflow.com/api     (Production)
```

---

## Route Definitions

### Authentication — `/api/auth`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | `ADMIN` |
| `POST` | `/api/auth/login` | Login and receive JWT token | Public |
| `POST` | `/api/auth/logout` | Invalidate session | Authenticated |
| `GET` | `/api/auth/me` | Get current logged-in user profile | Authenticated |
| `PUT` | `/api/auth/change-password` | Update own password | Authenticated |

---

### Users — `/api/users`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | List all users (paginated) | `ADMIN`, `ASSET_MANAGER` |
| `GET` | `/api/users/:id` | Get a single user by ID | `ADMIN`, `ASSET_MANAGER` |
| `PUT` | `/api/users/:id` | Update user details | `ADMIN` |
| `PATCH` | `/api/users/:id/status` | Activate or deactivate a user | `ADMIN` |
| `DELETE` | `/api/users/:id` | Delete a user | `ADMIN` |

---

### Departments — `/api/departments`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | List all departments | Authenticated |
| `GET` | `/api/departments/:id` | Get a single department | Authenticated |
| `POST` | `/api/departments` | Create a department | `ADMIN` |
| `PUT` | `/api/departments/:id` | Update a department | `ADMIN` |
| `DELETE` | `/api/departments/:id` | Delete a department | `ADMIN` |

---

### Categories — `/api/categories`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | List all categories | Authenticated |
| `GET` | `/api/categories/:id` | Get a single category | Authenticated |
| `POST` | `/api/categories` | Create a category | `ADMIN`, `ASSET_MANAGER` |
| `PUT` | `/api/categories/:id` | Update a category | `ADMIN`, `ASSET_MANAGER` |
| `DELETE` | `/api/categories/:id` | Delete a category | `ADMIN` |

---

### Assets — `/api/assets`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assets` | List all assets (paginated, filterable) | Authenticated |
| `GET` | `/api/assets/:id` | Get a single asset | Authenticated |
| `POST` | `/api/assets` | Register a new asset | `ADMIN`, `ASSET_MANAGER` |
| `PUT` | `/api/assets/:id` | Update asset details | `ADMIN`, `ASSET_MANAGER` |
| `DELETE` | `/api/assets/:id` | Remove an asset record | `ADMIN` |
| `GET` | `/api/assets/:id/history` | Get history log for an asset | `ADMIN`, `ASSET_MANAGER` |

---

### Allocations — `/api/allocations`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/allocations` | List all allocations (paginated) | `ADMIN`, `ASSET_MANAGER` |
| `GET` | `/api/allocations/:id` | Get a single allocation | `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD` |
| `POST` | `/api/allocations` | Create a new allocation | `ADMIN`, `ASSET_MANAGER` |
| `PATCH` | `/api/allocations/:id/return` | Return an allocated asset | `ADMIN`, `ASSET_MANAGER` |
| `POST` | `/api/allocations/:id/transfer` | Request a transfer | `EMPLOYEE`, `DEPARTMENT_HEAD` |
| `PATCH` | `/api/allocations/:id/transfer/approve` | Approve a transfer | `ADMIN`, `ASSET_MANAGER` |
| `PATCH` | `/api/allocations/:id/transfer/reject` | Reject a transfer | `ADMIN`, `ASSET_MANAGER` |

---

### Bookings — `/api/bookings`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bookings` | List all bookings (paginated) | `ADMIN`, `ASSET_MANAGER` |
| `GET` | `/api/bookings/my` | Get own bookings | Authenticated |
| `GET` | `/api/bookings/:id` | Get a single booking | Authenticated |
| `POST` | `/api/bookings` | Create a new booking | Authenticated |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel a booking | Authenticated (own) or `ADMIN` |

---

### Maintenance — `/api/maintenance`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/maintenance` | List all maintenance requests | `ADMIN`, `ASSET_MANAGER` |
| `GET` | `/api/maintenance/my` | Get own submitted requests | Authenticated |
| `GET` | `/api/maintenance/:id` | Get a single request | Authenticated |
| `POST` | `/api/maintenance` | Raise a maintenance request | Authenticated |
| `PATCH` | `/api/maintenance/:id/approve` | Approve a request | `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD` |
| `PATCH` | `/api/maintenance/:id/reject` | Reject a request | `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD` |
| `PATCH` | `/api/maintenance/:id/assign` | Assign an employee as technician | `ADMIN`, `ASSET_MANAGER` |
| `PATCH` | `/api/maintenance/:id/resolve` | Mark as resolved | `ADMIN`, `ASSET_MANAGER` |

---

### Audits — `/api/audits`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/audits` | List all audit cycles | `ADMIN`, `ASSET_MANAGER` |
| `GET` | `/api/audits/:id` | Get a single audit | `ADMIN`, `ASSET_MANAGER` |
| `POST` | `/api/audits` | Create an audit cycle | `ADMIN`, `ASSET_MANAGER` |
| `PATCH` | `/api/audits/:id/start` | Set audit to `ACTIVE` | `ADMIN`, `ASSET_MANAGER` |
| `PATCH` | `/api/audits/:id/verify` | Add assets to `verifiedAssets` | `ADMIN`, `ASSET_MANAGER` |
| `PATCH` | `/api/audits/:id/missing` | Report assets as missing | `ADMIN`, `ASSET_MANAGER` |
| `PATCH` | `/api/audits/:id/damaged` | Report assets as damaged | `ADMIN`, `ASSET_MANAGER` |
| `PATCH` | `/api/audits/:id/complete` | Mark audit as `COMPLETED` | `ADMIN`, `ASSET_MANAGER` |
| `PATCH` | `/api/audits/:id/close` | Close the audit cycle | `ADMIN`, `ASSET_MANAGER` |

---

### Notifications — `/api/notifications`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Get own notifications | Authenticated |
| `PATCH` | `/api/notifications/:id/read` | Mark notification as read | Authenticated (own) |
| `PATCH` | `/api/notifications/read-all` | Mark all as read | Authenticated |

---

### Reports — `/api/reports`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/assets` | Asset inventory summary | `ADMIN`, `ASSET_MANAGER` |
| `GET` | `/api/reports/allocations` | Allocation history report | `ADMIN`, `ASSET_MANAGER` |
| `GET` | `/api/reports/maintenance` | Maintenance cost & status report | `ADMIN`, `ASSET_MANAGER` |
| `GET` | `/api/reports/audits` | Audit results summary | `ADMIN`, `ASSET_MANAGER` |
| `GET` | `/api/reports/department/:id` | Department-level asset report | `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD` |

---

## Frontend Usage (Axios)
```js
// constants/apiRoutes.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ROUTES = {
  AUTH:          `${BASE_URL}/auth`,
  USERS:         `${BASE_URL}/users`,
  DEPARTMENTS:   `${BASE_URL}/departments`,
  CATEGORIES:    `${BASE_URL}/categories`,
  ASSETS:        `${BASE_URL}/assets`,
  ALLOCATIONS:   `${BASE_URL}/allocations`,
  BOOKINGS:      `${BASE_URL}/bookings`,
  MAINTENANCE:   `${BASE_URL}/maintenance`,
  AUDITS:        `${BASE_URL}/audits`,
  NOTIFICATIONS: `${BASE_URL}/notifications`,
  REPORTS:       `${BASE_URL}/reports`,
};
```

## Backend Usage (Express)
```js
// routes/index.js
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/departments',   departmentRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/assets',        assetRoutes);
app.use('/api/allocations',   allocationRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/maintenance',   maintenanceRoutes);
app.use('/api/audits',        auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports',       reportRoutes);
```
