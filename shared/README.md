# AssetFlow — Shared Documentation

## Purpose
The `shared/` folder is the **single source of truth** for the entire AssetFlow ERP project. It defines the contracts that the frontend and backend teams must adhere to independently. Any value defined here — an enum, a route path, a validation rule, a response shape — must not be redefined or contradicted elsewhere in the codebase.

> ⚠️ **Do not invent values outside this folder.** If a status, role, or route is not defined here, it does not exist in the system.

---

## Folder Structure

```
shared/
│
├── enums/                    # All enumerated constant values
│   ├── roles.md              # ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD, EMPLOYEE
│   ├── assetStatus.md        # AVAILABLE, ALLOCATED, RESERVED, UNDER_MAINTENANCE, LOST, RETIRED, DISPOSED
│   ├── bookingStatus.md      # UPCOMING, ONGOING, COMPLETED, CANCELLED
│   ├── maintenanceStatus.md  # PENDING, APPROVED, REJECTED, TECHNICIAN_ASSIGNED, IN_PROGRESS, RESOLVED
│   ├── auditStatus.md        # PLANNED, ACTIVE, COMPLETED, CLOSED
│   ├── notificationType.md   # ALLOCATION, TRANSFER_REQUEST, MAINTENANCE_ALERT, BOOKING_CONFIRMATION, AUDIT_ALERT, SYSTEM
│   └── priority.md           # LOW, MEDIUM, HIGH, CRITICAL
│
├── constants/                # Global application constants
│   ├── apiRoutes.md          # All REST endpoint paths (backend + frontend reference)
│   ├── validationRules.md    # Field-level validation rules (backend + frontend)
│   ├── permissions.md        # Role-based access control matrix per operation
│   └── appConfig.md          # App name, timezone, pagination defaults, supported enums
│
├── config/                   # Infrastructure and environment configuration
│   ├── environment.md        # All .env variables with descriptions and examples
│   └── folderStructure.md    # Canonical monorepo layout with team ownership
│
├── types/                    # Standard data shapes and response formats
│   ├── apiResponse.md        # Success, Error, Validation Error response envelopes
│   ├── pagination.md         # Paginated list response format and query parameters
│   └── common.md             # Shared sub-document shapes (Location, PurchaseInfo, etc.)
│
└── README.md                 # This file
```

---

## How the Frontend Uses This

| Shared File | Frontend Usage |
| :--- | :--- |
| `enums/roles.md` | Route guards, conditional rendering, `usePermission` hook |
| `enums/assetStatus.md` | Status badge colors, dropdown filter options |
| `enums/bookingStatus.md` | Booking list filters, status indicators |
| `enums/maintenanceStatus.md` | Maintenance workflow display |
| `enums/priority.md` | Priority badge colors, sort order |
| `constants/apiRoutes.md` | Axios service base URLs |
| `constants/validationRules.md` | React Hook Form validators |
| `constants/permissions.md` | `usePermission` hook, hide/show UI elements |
| `constants/appConfig.md` | Page titles, pagination defaults |
| `config/environment.md` | `.env` variable names (`VITE_API_BASE_URL`) |
| `types/apiResponse.md` | Axios interceptor response handler |
| `types/pagination.md` | Pagination hook and component logic |
| `types/common.md` | Form field shapes, API payload construction |

---

## How the Backend Uses This

| Shared File | Backend Usage |
| :--- | :--- |
| `enums/roles.md` | Mongoose enum values in `User.js`, `authorize` middleware |
| `enums/assetStatus.md` | Mongoose enum in `Asset.js`, status transition logic |
| `enums/bookingStatus.md` | Mongoose enum in `Booking.js`, cron job transitions |
| `enums/maintenanceStatus.md` | Mongoose enum in `Maintenance.js`, approval workflow hooks |
| `enums/auditStatus.md` | Mongoose enum in `Audit.js`, closure lock middleware |
| `enums/priority.md` | Mongoose enum in `Maintenance.js` |
| `enums/notificationType.md` | Mongoose enum in `Notification.js`, auto-trigger service |
| `constants/apiRoutes.md` | Express route registration in `routes/index.js` |
| `constants/validationRules.md` | Mongoose field validators, express-validator rules |
| `constants/permissions.md` | `authorize()` middleware per route |
| `constants/appConfig.md` | `config/appConfig.js` exported constants |
| `config/environment.md` | `.env.example` template |
| `types/apiResponse.md` | `utils/ApiResponse.js` response helper |
| `types/pagination.md` | `utils/paginate.js` helper function |

---

## Guidelines for All Teams

1. **Read before building** — consult relevant shared files before implementing a feature.
2. **Do not duplicate** — never redefine an enum, route, or validation rule in frontend or backend code directly. Import from the shared pattern.
3. **Propose changes collaboratively** — if you need to add a new enum value, route, or permission rule, update the shared file and notify all teams.
4. **Database compatibility** — all shared values must remain consistent with the field definitions in `database/schemas/`. Do not modify collection names, field names, or status values without coordinating with the database architect.
5. **No business logic here** — this folder contains contracts and documentation only. No executable code lives here.
