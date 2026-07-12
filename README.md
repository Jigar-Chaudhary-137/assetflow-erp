# 📦 AssetFlow ERP — Enterprise Asset Management System

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18.x+-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v18.x-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.x-38B2AC.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6.x+-47A248.svg)](https://www.mongodb.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](https://github.com/your-username/assetflow-erp/pulls)

**AssetFlow ERP** is a modern, premium Enterprise Resource Planning system designed to audit, track, allocate, and orchestrate the lifecycle of organizational assets. Built with security, performance, and role-based access controls in mind, it provides businesses with absolute visibility into inventory custodianship, pending bookings, transfers, and maintenance overheads.

[Explore Swagger Docs](http://localhost:5001/api/docs) · [Report Bug](https://github.com/your-username/assetflow-erp/issues) · [Request Feature](https://github.com/your-username/assetflow-erp/issues)

</div>

---

## 📋 Table of Contents
1. [✨ Key Features](#-key-features)
2. [⚙️ Tech Stack](#%EF%B8%8F-tech-stack)
3. [🏗️ System Architecture](#%EF%B8%8F-system-architecture)
4. [📂 Folder Structure](#-folder-structure)
5. [🚀 Installation & Setup](#-installation--setup)
6. [🔑 Environment Variables](#-environment-variables)
7. [⚡ Running the Project](#-running-the-project)
8. [🔌 API Endpoints](#-api-endpoints)
9. [🗄️ Database Schema Overview](#%EF%B8%8F-database-schema-overview)
10. [🛡️ Authentication & Authorization Flow](#%EF%B8%8F-authentication--authorization-flow)
11. [🎭 User Roles & Permissions Matrix](#-user-roles--permissions-matrix)
12. [📸 Screenshots](#-screenshots)
13. [🔒 Security Features](#-security-features)
14. [🚀 Performance Optimizations](#-performance-optimizations)
15. [☁️ Deployment Guide](#%EF%B8%8F-deployment-guide)
16. [🧪 Testing Instructions](#-testing-instructions)
17. [🔮 Future Enhancements](#-future-enhancements)
18. [🤝 Contributing Guidelines](#-contributing-guidelines)
19. [📄 License](#-license)
20. [✍️ Author](#%EF%B8%8F-author)
21. [🙏 Acknowledgements](#-acknowledgements)

---

## 🔍 Project Overview
In modern enterprise environments, tracking the lifecycle of physical assets (laptops, servers, furniture, tools) and managing custodianship transitions can become incredibly complex. **AssetFlow ERP** addresses this challenge by providing a secure, centralized portal. Managers and administrators can register items, schedule audits, verify device conditions, and coordinate transfers between employees and departments with an auto-notifying dashboard.

---

## ✨ Key Features

<details>
<summary><b>1. Inventory & Category Management</b> (Click to Expand)</summary>

- **Asset Lifecycle Tracking**: Instantly view status transitions from `AVAILABLE` to `ALLOCATED`, `RESERVED`, `UNDER_MAINTENANCE`, `LOST`, `RETIRED`, or `DISPOSED`.
- **Dynamic Categories**: Register custom classifications with specific prefix tags (e.g., `LAP` for Laptops) to auto-generate unique asset tags.
- **Specifications & Purchase Fields**: Record detailed hardware configurations, purchase dates, warranty expirations, and costs.
</details>

<details>
<summary><b>2. Allocation & Custodianship Management</b> (Click to Expand)</summary>

- **Check-Out / Check-In Flow**: Deploy assets to staff members with strict date rules.
- **Peer-to-Peer Transfers**: Streamlined custodian handovers. Staff can request direct transfers which update department links once approved by management.
- **Active Booking Engine**: Pre-schedule asset reservations for up to 24 hours with overlap validations.
</details>

<details>
<summary><b>3. Maintenance & Audit Operations</b> (Click to Expand)</summary>

- **Maintenance Scheduling**: Log maintenance tasks with vendor information, scheduled dates, and estimated costs, temporarily locking allocations.
- **Audit Cycles**: Schedule and execute inventory audits to verify physical asset tags and document found states (`GOOD`, `DAMAGED`, `MISSING`).
</details>

<details>
<summary><b>4. Real-time Notifications & Analytics</b> (Click to Expand)</summary>

- **System Messages**: Users are automatically notified of allocation statuses, pending transfer request decisions, or scheduled maintenance.
- **Aggregation Pipelines**: Real-time analytical dashboard showing asset distributions by category and department, total valuation, and audit trends.
- **Exports**: Download detailed PDF reports and Excel sheets directly from the portal.
</details>

---

## ⚙️ Tech Stack

| Layer | Technology | Version | Description |
|---|---|---|---|
| **Frontend** | ReactJS | v18.x | View component rendering & state architecture. |
| | Vite | v5.x | High-performance client bundling & HMR dev server. |
| | Tailwind CSS | v3.x | Utility-first styling with custom ERP theme presets. |
| | Axios | v1.x | Client requests with automated JWT refresh interceptors. |
| **Backend** | Node.js | v18.x+ | Server execution environment. |
| | Express.js | v4.x | REST API MVC routing framework. |
| | JWT | v9.x | Signed tokens for stateless session control. |
| | bcryptjs | v2.x | Secure blowfish password hashing. |
| **Database** | MongoDB | v6.x+ | Document database storage. |
| | Mongoose | v8.x | MongoDB object modeling and validation middleware. |

---

## 🏗️ System Architecture

The following Mermaid diagram outlines the end-to-end system data flow and integration boundary:

```mermaid
graph TD
    %% Client Layer
    subgraph Client Layer (React + Vite)
        A[SPA Interface] --> B[Axios Instance]
        B -->|JWT Refresh Interceptor| C[Local Storage]
    end

    %% API Layer
    subgraph Service Boundary (Express.js)
        D[Router Gate] -->|Auth Middleware| E[RBAC Validator]
        E --> F[Controller Handler]
        F -->|Aggregation & Query| G[Mongoose Schema Layer]
    end

    %% Storage Layer
    subgraph Storage Layer
        G --> H[(MongoDB Database)]
    end

    %% Integration Flows
    B -->|HTTP Requests on Port 5001| D
    F -->|PDFKit / ExcelJS| I[File Exporters]
    I -->|Blob Stream| B
```

---

## 📂 Folder Structure

```
assetflow-erp/
├── backend/
│   ├── config/             # DB connection, Swagger API specifications
│   ├── controllers/        # Controllers (MVC Request Handlers)
│   ├── middleware/         # Auth verify, RBAC weights, Activity logger, Error interceptor
│   ├── models/             # Mongoose schemas (User, Asset, Category, Allocation, etc.)
│   ├── routes/             # API routes definitions
│   ├── seeder/             # DB Seed script and structural JSON data files
│   ├── services/           # DB aggregation pipelines, booking validation services
│   ├── utils/              # Wrappers (ApiResponse, ApiError, asyncHandler)
│   ├── validations/        # Express-validator schema rules
│   ├── app.js              # Express app setup and middleware registration
│   └── server.js           # Server port listener entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # UI elements (Modals, ProtectedRoute, Layout)
│   │   ├── context/        # React Context stores (Auth, Notifications)
│   │   ├── pages/          # Screen views (Assets, Bookings, Dashboard, Users)
│   │   └── services/       # Axios API wrapper request scripts
│   ├── index.html          # SPA root file
│   ├── vite.config.js      # Bundler configurations
│   └── tailwind.config.js  # Styling guidelines
├── package.json            # Monorepo scripts and workspace settings
└── README.md               # User documentation guide
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v18 or higher installed locally.
- **MongoDB** running locally on port `27017` or a remote MongoDB Atlas URI.

### Step-by-Step Installation
1. Clone the project to your local directory:
   ```bash
   git clone https://github.com/your-username/assetflow-erp.git
   cd assetflow-erp
   ```

2. Install all dependencies for the workspace (using npm workspaces, this installs root, backend, and frontend dependencies in a single step):
   ```bash
   npm install
   ```

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory using the following example:

```env
# Backend server port Configuration
PORT=5001

# MongoDB Connection String (Atlas or Local)
MONGODB_URI=mongodb://localhost:27017/assetflow

# Authentication Secret Configuration keys
ACCESS_TOKEN_SECRET=super_secret_access_token_key_for_assetflow_12345
REFRESH_TOKEN_SECRET=super_secret_refresh_token_key_for_assetflow_54321

# Expiration policies
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Environment setup
NODE_ENV=development
```

---

## ⚡ Running the Project

### Database Seeding
To populate MongoDB with initial categories, departments, user profiles, assets, and sample operations, run:
```bash
npm run seed --prefix backend
```

### Dev Mode Startup
Run the following single command from the monorepo root directory:
```bash
npm run dev
```
*This command runs both dev servers concurrently. The backend runs on `http://localhost:5001` and the frontend exposes `http://localhost:5173/`.*

---

## 🔌 API Endpoints

### 🔑 Authentication (`/api/auth`)
| HTTP Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Registers a new employee profile. |
| `POST` | `/api/auth/login` | Public | Verifies credentials, returns JWT profile. |
| `POST` | `/api/auth/refresh` | Public | Refreshes expired Access Tokens. |
| `GET` | `/api/auth/me` | Protected | Retrieves current profile. |
| `POST` | `/api/auth/logout` | Protected | Logs user out, clearing token state. |

### 📦 Asset Inventory (`/api/assets`)
| HTTP Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET` | `/api/assets` | Admin, Manager, Staff | Lists assets with pagination & search. |
| `GET` | `/api/assets/:id` | Admin, Manager, Staff | Retrieves a single asset's details. |
| `POST` | `/api/assets` | Admin, Manager | Creates a new asset. |
| `PUT` | `/api/assets/:id` | Admin, Manager | Updates asset specifications. |
| `DELETE` | `/api/assets/:id` | Admin, Manager | Performs soft-delete by deactivating status. |

### 📅 Allocations & Bookings (`/api/allocations` & `/api/bookings`)
| HTTP Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/api/allocations` | Admin, Manager | Creates an active allocation check-out. |
| `POST` | `/api/allocations/:id/return` | Admin, Manager | Check-in return allocation. |
| `POST` | `/api/allocations/:id/transfer` | Admin, Manager, Staff | Requests peer-to-peer transfer. |
| `PATCH`| `/api/allocations/:id/transfer/approve`| Admin, Manager | Confirms transfer request. |
| `POST` | `/api/bookings` | Admin, Manager, Staff | Books a resource for a future slot. |

---

## 🗄️ Database Schema Overview

```
 ┌────────────────┐         ┌────────────────┐         ┌────────────────┐
 │      User      │         │     Asset      │         │   Department   │
 ├────────────────┤         ├────────────────┤         ├────────────────┤
 │ _id: ObjectId  │◄──┐     │ _id: ObjectId  │◄──┐     │ _id: ObjectId  │
 │ email: string  │   │     │ assetTag: str  │   │     │ name: string   │
 │ name: string   │   │     │ name: string   │   │     │ code: string   │
 │ role: string   │   │     │ status: enum   │   │     └────────────────┘
 └────────────────┘   │     └────────────────┘   │
                      │                          │
              ┌───────┴────────┐         ┌───────┴────────┐
              │   Allocation   │         │    Booking     │
              ├────────────────┤         ├────────────────┤
              │ employeeId     │         │ resourceId     │
              │ assetId        │─────────│ startTime      │
              │ status: enum   │         │ endTime        │
              └────────────────┘         └────────────────┘
```

---

## 🛡️ Authentication & Authorization Flow

```
User Login      Axios Request      Access Token (401)      Refresh Attempt       Retry Queue
    │                 │                    │                     │                   │
    ├─► Credentials   │                    │                     │                   │
    │   (POST Login)  │                    │                     │                   │
    │                 │                    │                     │                   │
    ◄─ JWT Token ◄────┤                    │                     │                   │
   Stored local       │                    │                     │                   │
                      ├─► Send with Bearer │                     │                   │
                      │                    │                     │                   │
                      ◄── Error 401 ───────┤                     │                   │
                      │                    ├─► Token Expired     │                   │
                      │                    │   Queue Actions     │                   │
                      │                    │                     │                   │
                      │                    ◄─► POST /refresh ────┤                   │
                      │                    │   Token Updated     │                   │
                      │                    │                     │                   │
                      ◄────────────────────┴─────────────────────┴──────── Retry ────┼──► API Success
```

---

## 🎭 User Roles & Permissions Matrix

| Feature Module | Admin | Manager (Asset Manager) | Staff (Employee) |
|---|---|---|---|
| **Register & Edit Assets** | ✅ Full Access | ✅ Full Access | ❌ Read Only |
| **Manage Users & Staff** | ✅ Full Access | ❌ Access Denied | ❌ Access Denied |
| **Setup Categories/Depts** | ✅ Full Access | ❌ Access Denied | ❌ Access Denied |
| **Perform Check-out** | ✅ Full Access | ✅ Full Access | ❌ Access Denied |
| **Book Resources** | ✅ Full Access | ✅ Full Access | ✅ User-owned only |
| **Request Asset Transfer** | ✅ Full Access | ✅ Full Access | ✅ Assigned items only |
| **Approve/Reject Transfer**| ✅ Full Access | ✅ Full Access | ❌ Access Denied |
| **Schedule Maintenance** | ✅ Full Access | ✅ Full Access | ❌ Access Denied |
| **Perform System Audit** | ✅ Full Access | ✅ Full Access | ❌ Access Denied |

---

## 📸 Screenshots

*Below are UI design references for key dashboard layouts:*

| Login Portal | Dashboard Layout |
|---|---|
| ![Login Portal](https://raw.githubusercontent.com/your-username/assetflow-erp/main/docs/login_form_filled.png) | ![Dashboard Overview](https://raw.githubusercontent.com/your-username/assetflow-erp/main/docs/dashboard_loaded.png) |

---

## 🔒 Security Features
- **Stateless Authentication**: Uses short-lived Access Tokens (15 min) and long-lived Refresh Tokens (7 days) for secure sessions.
- **Unified Encryption**: Passwords hashed using bcrypt blowfish algorithms.
- **RBAC Filters**: Strict server-side route validation weights mapping `Admin: 3`, `Manager: 2`, and `Staff: 1`.
- **Query Protection**: Express Validator rules prevent schema injection and validate input formats.

---

## 🚀 Performance Optimizations
- **Aggregation Pipelines**: Minimizes Mongoose populate overheads via optimized `$lookup` and `$group` operations.
- **Simultaneous Request Queue**: Axios interceptor prevents multiple simultaneous `/refresh` requests by queueing operations.
- **Database Indexing**: Pre-built indexes on `resourceId`, `employeeId`, and compound indexes for booking overlap validation.

---

## ☁️ Deployment Guide

<details>
<summary><b>1. MongoDB Atlas Setup</b> (Click to Expand)</summary>

1. Register at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Shared cluster, configure access IP rules (`0.0.0.0/0` or static server IP).
3. Copy the driver connection string (e.g. `mongodb+srv://<username>:<password>@cluster.mongodb.net/assetflow`).
4. Update the `MONGODB_URI` environment variable inside your server config.
</details>

<details>
<summary><b>2. Backend Deployment</b> (Click to Expand)</summary>

1. Deploy to a hosting provider such as Render or Heroku.
2. Link the repository, specify directory path `backend`.
3. Set environment variable variables matching the `.env` configuration.
4. Run standard start commands:
   ```bash
   npm run start
   ```
</details>

<details>
<summary><b>3. Frontend Deployment</b> (Click to Expand)</summary>

1. Link frontend codebase to hosting platforms like Vercel or Netlify.
2. Define base directory path: `frontend`.
3. Add environment variable:
   - `VITE_API_URL`: Your hosted backend URL (e.g. `https://api.yourdomain.com/api`).
4. Set build command: `npm run build` and output directory `dist`.
</details>

---

## 🧪 Testing Instructions
Run backend tests to verify router configurations, databases, and permissions models:
```bash
# Verify authentication flows
node backend/testAuth.js

# Verify resource booking validations and checks
node backend/testBooking.js

# Verify CRUD logic for assets
node backend/testAsset.js
```

---

## 🔮 Future Enhancements
- **QR Code Scanning**: Print and scan asset labels for quick status audits.
- **Email Triggers**: Send transactional notifications directly to email addresses.
- **Active Directory Integration**: Support single sign-on (SSO) with Okta and LDAP.

---

## 🤝 Contributing Guidelines
Contributions are welcome! Please follow these steps:
1. Fork the Project Repository.
2. Create a Feature Branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add new system feature'`).
4. Push to the Branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ✍️ Author
**Your Name / Organization**
- Website: [yourdomain.com](https://yourdomain.com)
- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)

---

## 🙏 Acknowledgements
- [Mongoose Docs](https://mongoosejs.com/)
- [Vite Bundler Guides](https://vitejs.dev/)
- [Lucide Icons Repository](https://lucide.dev/)
- [Swagger UI Library](https://swagger.io/)