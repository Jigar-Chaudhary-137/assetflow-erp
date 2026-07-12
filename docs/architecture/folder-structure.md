# Architecture: Folder Structure

AssetFlow is organized as a structured codebase with clear separation of responsibilities between teams.

## Workspace Layout

```text
assetflow-erp/
├── frontend/             # React 19 Client Application (Vite, Axios, Context)
│   ├── public/           # Static public assets
│   └── src/
│       ├── components/   # Reusable UI (common/ and feature-specific/)
│       ├── pages/        # Route components (auth/, assets/, bookings/, etc.)
│       └── services/     # Axios endpoint connectors
├── backend/              # Node.js + Express API Server
│   └── src/
│       ├── controllers/  # Route controllers (request parsing, response mapping)
│       ├── middleware/   # JWT verification, Role authorization, error handling
│       └── models/       # Mongoose Schemas (1:1 with database blueprints)
├── database/             # Schema definitions, seed values, and sample data
│   ├── diagrams/         # ER and flowchart diagrams
│   └── schemas/          # Collection definitions (.md format)
├── shared/               # The Single Source of Truth contracts
│   ├── enums/            # Canonical enums (roles, assetStatus, priority, etc.)
│   └── constants/        # API Routes, Validation Rules, Permissions matrix
└── docs/                 # Solution documentation and guides
```

---

## Folder Responsibilities & Ownership

| Directory | Owner | Major Responsibility | Integration Guideline |
| :--- | :--- | :--- | :--- |
| `frontend/` | Frontend Devs | UI layouts, forms, state, styling, client-side route guards. | Must use route paths from `shared/constants/apiRoutes.md` and fields from `shared/constants/validationRules.md`. |
| `backend/` | Backend Devs | REST controllers, DB persistence, validation logic, role checks. | Mongoose schemas must mirror `database/schemas/` 1:1. Endpoints must return standard envelopes. |
| `database/` | DB Architect | Schemas, unique indexes, indexes, and base data seeds. | Reference for Mongoose model creation. |
| `shared/` | System Architect | Global definitions, configurations, rules, and structures. | Immutable resource. Read-only for all executing systems. |
| `docs/` | Technical Lead | General documentation and Presentation resources. | Describes system operations. |
