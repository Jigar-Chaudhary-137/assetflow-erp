# Config: Folder Structure

## Purpose
Documents the canonical monorepo folder structure for AssetFlow. This is the authoritative reference for all team members. No new top-level folders should be added without updating this file. Folder purpose must not overlap across teams.

---

## Full Monorepo Layout

```
assetflow-erp/
│
├── frontend/                        # React 19 + Vite application
│   ├── public/                      # Static assets served directly
│   ├── src/
│   │   ├── assets/                  # Images, fonts, icons
│   │   ├── components/              # Reusable UI components
│   │   │   ├── common/              # Buttons, Inputs, Modals, Tables
│   │   │   ├── layout/              # Sidebar, Navbar, PageWrapper
│   │   │   └── [module]/            # Feature-specific components
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── auth/                # Login, Register
│   │   │   ├── dashboard/
│   │   │   ├── assets/
│   │   │   ├── allocations/
│   │   │   ├── bookings/
│   │   │   ├── maintenance/
│   │   │   ├── audits/
│   │   │   ├── departments/
│   │   │   ├── categories/
│   │   │   ├── employees/
│   │   │   ├── notifications/
│   │   │   └── reports/
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── context/                 # React Context providers (AuthContext)
│   │   ├── services/                # Axios API service functions
│   │   ├── utils/                   # Helpers (formatDate, formatCurrency)
│   │   ├── config/                  # App config constants (from shared/)
│   │   ├── routes/                  # React Router route definitions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                         # Node.js + Express REST API
│   ├── src/
│   │   ├── config/                  # DB connection, env loader
│   │   ├── controllers/             # Route handler functions
│   │   ├── middleware/              # Auth, authorize, errorHandler, validate
│   │   ├── models/                  # Mongoose models (one per collection)
│   │   │   ├── User.js
│   │   │   ├── Department.js
│   │   │   ├── Category.js
│   │   │   ├── Asset.js
│   │   │   ├── Allocation.js
│   │   │   ├── Booking.js
│   │   │   ├── Maintenance.js
│   │   │   ├── Audit.js
│   │   │   ├── Notification.js
│   │   │   └── ActivityLog.js
│   │   ├── routes/                  # Express route files
│   │   ├── services/                # Business logic layer
│   │   ├── utils/                   # Helpers (pagination, asyncHandler, ApiError)
│   │   └── app.js                   # Express app setup
│   ├── server.js                    # Entry point
│   └── package.json
│
├── database/                        # MongoDB architecture documentation
│   ├── diagrams/                    # ER diagram and database flow
│   ├── schemas/                     # Collection schema blueprints (.md)
│   ├── seed/                        # Seed data JSON files
│   ├── sample-data/                 # Sample transactional records
│   └── README.md
│
├── shared/                          # Single source of truth
│   ├── enums/                       # Status, role, priority enumerations
│   ├── constants/                   # API routes, validation rules, permissions, app config
│   ├── config/                      # Environment variables, folder structure
│   ├── types/                       # API response formats, pagination, common types
│   └── README.md
│
├── docs/                            # Project-level documentation
│
├── .gitignore
├── README.md
└── package.json                     # Root-level workspace config (if monorepo)
```

---

## Ownership by Team

| Folder | Owner | Description |
| :--- | :--- | :--- |
| `frontend/` | Frontend Developer | All React UI code |
| `backend/` | Backend Developer | All Express API code |
| `database/` | Database Architect | MongoDB schemas and seed data |
| `shared/` | System Architect / All Teams | Cross-team shared contracts |
| `docs/` | All Teams | General project documentation |

---

## Rules
1. **Do not create files in another team's folder** without prior discussion.
2. **`shared/`** is the only folder all teams read from — treat it as a contract.
3. Backend `models/` must correspond **1:1** to the collection blueprints in `database/schemas/`.
4. Frontend `services/` must use API paths defined in `shared/constants/apiRoutes.md`.
