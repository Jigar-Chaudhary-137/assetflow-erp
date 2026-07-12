# Config: Environment Variables

## Purpose
Documents all environment variables required to run the AssetFlow backend and frontend. These variables must be defined in a `.env` file (never committed to version control). A `.env.example` template should be committed in place of the actual `.env` file.

---

## Backend Environment Variables

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Environment mode: `development`, `production`, `test` |
| `PORT` | Yes | `5000` | Port the Express server listens on |
| `MONGODB_URI` | Yes | — | Full MongoDB connection string (e.g., `mongodb://localhost:27017/assetflow`) |
| `JWT_SECRET` | Yes | — | Secret key used to sign JWT tokens. Must be a long, random string |
| `JWT_EXPIRES_IN` | No | `7d` | JWT token expiry duration (e.g., `7d`, `24h`) |
| `BCRYPT_SALT_ROUNDS` | No | `10` | Number of bcrypt hashing rounds |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Frontend origin URL used for CORS configuration |

### Backend `.env.example`
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/assetflow
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
FRONTEND_URL=http://localhost:5173
```

---

## Frontend Environment Variables

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | `http://localhost:5000/api` | Base URL of the backend API |
| `VITE_APP_NAME` | No | `AssetFlow` | Application name used in the page title |

### Frontend `.env.example`
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=AssetFlow
```

---

## Frontend Usage (Vite)
```js
// Accessing environment variables in React
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const appName    = import.meta.env.VITE_APP_NAME;
```

## Backend Usage (Node.js)
```js
// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
};
```

---

## Security Rules
1. **Never commit `.env`** — add it to `.gitignore`.
2. Commit only `.env.example` with placeholder values.
3. `JWT_SECRET` must be at least 32 random characters in production.
4. Use different `MONGODB_URI` values for development, staging, and production.
