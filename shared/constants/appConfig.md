# Constants: App Configuration

## Purpose
Defines global application configuration constants used across both the backend (Express/Node.js) and frontend (React/Vite). These values control application behavior including pagination, formatting, supported enumerations, and feature flags.

---

## Application Identity

| Key | Value |
| :--- | :--- |
| `APP_NAME` | `AssetFlow` |
| `APP_VERSION` | `1.0.0` |
| `APP_DESCRIPTION` | `Enterprise Asset & Resource Management System` |

---

## Date & Time

| Key | Value | Notes |
| :--- | :--- | :--- |
| `TIMEZONE` | `UTC` | All timestamps stored and returned in UTC |
| `DATE_FORMAT` | `YYYY-MM-DD` | ISO 8601 date-only format |
| `DATETIME_FORMAT` | `YYYY-MM-DDTHH:mm:ss.sssZ` | ISO 8601 full UTC datetime |

---

## Pagination Defaults

| Key | Value | Notes |
| :--- | :--- | :--- |
| `DEFAULT_PAGE` | `1` | First page number |
| `DEFAULT_PAGE_SIZE` | `20` | Items returned per page |
| `MAX_PAGE_SIZE` | `100` | Upper cap to prevent over-fetching |

---

## Authentication

| Key | Value | Notes |
| :--- | :--- | :--- |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiry duration |
| `BCRYPT_SALT_ROUNDS` | `10` | bcrypt hashing cost factor |

---

## Supported Roles

```js
const ROLES = ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'];
```

---

## Supported Asset Statuses

```js
const ASSET_STATUSES = ['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED'];
```

---

## Supported Booking Statuses

```js
const BOOKING_STATUSES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];
```

---

## Supported Maintenance Statuses

```js
const MAINTENANCE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
```

---

## Supported Audit Statuses

```js
const AUDIT_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'CLOSED'];
```

---

## Supported Priority Levels

```js
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
```

---

## Asset Tag Format

```js
// Format: AST-{CATEGORY_CODE}-{4-digit number}
// Example: AST-LAP-0001, AST-MON-0012, AST-CR-0003
const ASSET_TAG_PATTERN = /^AST-[A-Z]{2,5}-\d{4}$/;
```

---

## Backend Usage (Node.js/Express)

```js
// config/appConfig.js
module.exports = {
  APP_NAME:            'AssetFlow',
  APP_VERSION:         '1.0.0',
  TIMEZONE:            'UTC',
  DATE_FORMAT:         'YYYY-MM-DD',
  JWT_EXPIRES_IN:      '7d',
  BCRYPT_SALT_ROUNDS:  10,
  DEFAULT_PAGE:        1,
  DEFAULT_PAGE_SIZE:   20,
  MAX_PAGE_SIZE:       100,
  ROLES:               ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
  ASSET_STATUSES:      ['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED'],
  BOOKING_STATUSES:    ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
  MAINTENANCE_STATUSES:['PENDING', 'APPROVED', 'REJECTED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED'],
  AUDIT_STATUSES:      ['PLANNED', 'ACTIVE', 'COMPLETED', 'CLOSED'],
  PRIORITIES:          ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
};
```

---

## Frontend Usage (React/Vite)

```js
// src/config/appConfig.js
export const APP_NAME           = 'AssetFlow';
export const DEFAULT_PAGE_SIZE  = 20;
export const DATE_FORMAT        = 'YYYY-MM-DD';

export const ROLES = ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'];

export const ASSET_STATUSES = [
  'AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED'
];
```
