# Architecture: Technology Stack

AssetFlow ERP is built on a modern JavaScript-centric stack for seamless integration and compatibility.

## Core Technologies

### 1. Frontend Client
* **Framework**: React 19
* **Build System**: Vite
* **HTTP Client**: Axios (configured with intercepts for JWT injection and envelope formatting)
* **Form Management**: React Hook Form
* **Styling**: Vanilla CSS (modular design system with variables matching shared constants)
* **Routing**: React Router DOM (v6)

### 2. Backend API
* **Runtime**: Node.js (v18+)
* **Framework**: Express.js
* **ODM**: Mongoose (for MongoDB integration)
* **Security & Auth**:
  * `jsonwebtoken` (JWT standard validation)
  * `bcryptjs` (BCrypt password hashing)
* **CORS Middleware**: Configured to restrict origin requests to the frontend client URL

### 3. Database
* **Database**: MongoDB (v6.0+)
* **Driver**: Mongoose MongoDB ODM

---

## Workspace Dependencies & Package Responsibilities

```text
Dependency           | Role in Project
---------------------|---------------------------------------------------------
react, react-dom     | Declarative UI rendering (React 19)
axios                | API requests with standard JWT and response interceptors
express              | Web server and routing pipeline
mongoose             | Strict Schema mapping and MongoDB indexing
jsonwebtoken         | Session token generation (login) and authentication check
bcryptjs             | Securing passwords prior to saving in database
cors                 | Restricting resource queries to validated domains
```
