# Deployment: Environment Configuration

This document lists the required environment variables to run the AssetFlow backend and frontend.

---

## 1. Backend Environment Variables

Create a `.env` file in the `backend/` directory.

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Environment mode: `development`, `production`, `test` |
| `PORT` | Yes | `5000` | Port the Express server listens on |
| `MONGODB_URI` | Yes | — | MongoDB connection string (e.g. `mongodb://localhost:27017/assetflow`) |
| `JWT_SECRET` | Yes | — | Secret key used to sign JWT tokens (min 32 characters) |
| `JWT_EXPIRES_IN` | No | `7d` | JWT token expiration duration (e.g., `7d`, `24h`) |
| `BCRYPT_SALT_ROUNDS` | No | `10` | Number of bcrypt hashing rounds |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Frontend origin URL for CORS config |

### Backend `.env.example` Template
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

## 2. Frontend Environment Variables

Create a `.env` file in the `frontend/` directory.

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | `http://localhost:5000/api` | Base URL of the backend API |
| `VITE_APP_NAME` | No | `AssetFlow` | Application name used in page titles |

### Frontend `.env.example` Template
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=AssetFlow
```

---

## Security Guidelines

1. **Do not commit `.env` files**: Ensure they are added to `.gitignore`.
2. **Production Secrets**: In production, ensure `JWT_SECRET` is a cryptographically secure random string.
3. **Database URL**: Use a secure MongoDB Atlas cluster URI for production deployments.
