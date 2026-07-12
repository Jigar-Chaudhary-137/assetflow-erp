# Asset Flow ERP

Asset Flow ERP is a premium enterprise resource planning system designed to manage, allocate, track custodianship, request maintenance, audit, and report asset lifecycles across organization departments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Variables](#environment-variables)
4. [Running the Application](#running-the-application)
5. [Authentication Flow](#authentication-flow)
6. [API Documentation (Swagger)](#api-documentation-swagger)
7. [Postman Collection](#postman-collection)
8. [Folder Structure](#folder-structure)
9. [Available Modules](#available-modules)

---

## Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** (Local instance or MongoDB Atlas Connection string)
- **NPM** (v9.x or higher)

---

## Installation

### Clone the repository and install dependencies:

From the root directory of the project:
```bash
# Install all dependencies (root, backend, and frontend)
npm install
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory using the `.env.example` template:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/assetflow
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=development
```

---

## Running the Application

Start both the backend server and frontend development server simultaneously with a single command from the root directory:

```bash
# Start both frontend and backend development servers
npm run dev
```

The backend server runs on `http://localhost:5001` and the frontend interface is exposed at `http://localhost:5173`.

Alternatively, you can run them individually:

### Backend Server
From the `backend/` directory:
```bash
# Run server in development mode
npm run dev
```

### Frontend Dev Server
From the `frontend/` directory:
```bash
# Run frontend dev server
npm run dev
```

---

## Authentication Flow
1. **Register**: Register users via `POST /api/auth/register`. A unified user and employee profile is created.
2. **Login**: Authenticate via `POST /api/auth/login` to obtain an Access Token (JWT) and Refresh Token.
3. **Authorized Requests**: For all protected routes, include the Access Token in the request header:
   ```http
   Authorization: Bearer <JWT_ACCESS_TOKEN>
   ```
4. **Token Refresh**: When the access token expires, request a new one via `POST /api/auth/refresh` sending the refresh token.

---

## API Documentation (Swagger)
Interactive API documentation with built-in JWT test support is available at:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## Postman Collection
A complete Postman Collection is available in the root folder as `postman_collection.json`. It provides template parameters, variables for `baseUrl` and `jwtToken`, and pre-configured authorization scopes.

---

## Folder Structure

```
assetflow-erp/
├── backend/
│   ├── config/             # Database and Swagger setup
│   ├── controllers/        # REST route handler controllers
│   ├── middleware/         # Auth, RBAC, logging, validation and error handlers
│   ├── models/             # Mongoose schemas & models
│   ├── routes/             # Express routes mounting
│   ├── services/           # Aggregations, booking logic and email wrappers
│   ├── utils/              # API formatting wrappers (ApiResponse, ApiError)
│   ├── validations/        # Express-validators rules
│   ├── server.js           # Server startup script
│   └── app.js              # Application middleware orchestration
├── frontend/               # UI components and single page application logic
├── docs/                   # Markdown architecture descriptions
└── postman_collection.json # Exported Postman requests collection
```

---

## Available Modules

- **Authentication & RBAC**: Safe registration, JWT token generation, cookie clears, and access rights management (Admin, Manager, Employee/Staff).
- **Users (Employees)**: Admin interface to manage profiles, update designations, and deactivate accounts.
- **Categories & Departments**: Master organization classifications CRUD.
- **Asset Inventory**: Record codes, specifications, location maps, and warranties.
- **Allocations (Check-Out/In)**: Assign assets to employees, checking booking validation availability rules, and return tags.
- **Custodianship Transfers**: Request peer-to-peer transfers, managers approve, assets department details sync.
- **Maintenance Alerts**: Schedule repair windows, locks allocations while under maintenance, record cost totals.
- **Audit Cycles**: Plan cycle codes, auditor lists, verify assets and label found condition states (GOOD, DAMAGED, MISSING).
- **In-App Notifications**:Centralized triggers warning users on status updates.
- **Activity Log Logs**: Audit logging trails recording HTTP actions.
- **Aggregations & Reports**: Analytical pipelines showing valuations, trends, and repair statistics.
- **Spreadsheet & PDF Exports**: Download report spreadsheets (Excel) and print layouts (PDF).