# AssetFlow ERP — Project Documentation

Welcome to the central technical documentation and integration guide for **AssetFlow (Enterprise Asset & Resource Management System)**.

This documentation serves as the single source of instructions for frontend, backend, database developers, and judges. It guides development and integration, and provides resource templates for hackathon evaluation.

---

## Folder Structure

All documentation is organized into functional areas:

```text
docs/
├── api/                  # REST API Endpoints, methods, payloads, and validations
├── architecture/         # System design, folder ownership, tech stack, and communications
├── workflow/             # Interactive flow diagrams for asset, booking, maintenance and audit lifecycles
├── deployment/           # Environment setup, local configuration, and basic deployment instructions
├── presentation/         # Demo scripts, judging criteria, and future expansion scope
└── README.md             # This file (Documentation Index and Rules)
```

---

## How to Use These Documents

1. **For Frontend Developers**: Refer to `docs/api/` for route endpoints, parameter shapes, and validation logic. Consult `docs/architecture/integration-flow.md` to see React-to-Backend integration.
2. **For Backend Developers**: Use `docs/api/` as the blueprint to build controllers and routers. Ensure all status codes and errors match the specified schemas.
3. **For Database Developers**: Check `database/` for MongoDB collections and indexes, and cross-reference with `docs/workflow/` for state-transition validations.
4. **For Judges**: Review `docs/presentation/` to understand the key features, architectural highlights, innovation points, and future scope.

---

## Relationship with Other Folders

This repository uses a monorepo-inspired folder structure where contracts are strictly defined and isolated:

- **[database/](file:///c:/Users/Jigar/assetflow-erp-1/database/)**: The single source of truth for the physical data structures, MongoDB collection schemas, and indexes. All API request/response properties and workflows documented here must map 1:1 to these collections.
- **[shared/](file:///c:/Users/Jigar/assetflow-erp-1/shared/)**: The single source of truth for constants, permission matrices, field validation rules, and environment keys. Both frontend and backend developers must import/read from this directory directly to prevent duplication.

---

## Documentation Guidelines

- **Zero duplication**: Never redefine an enum, rule, or model schema in documentation. Refer directly to the definitions in `shared/` or `database/`.
- **Implementation-first**: Keep explanations concise and omit theoretical overhead. Focus on input/output schemas, code structures, and concrete workflows.
- **Keep in Sync**: Any updates to route paths, roles, or database fields must be updated in `shared/` or `database/` first, then reflected in `docs/`.
