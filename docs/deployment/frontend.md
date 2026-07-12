# Deployment: Frontend Setup

Guide to configuring, building, and deploying the React 19 + Vite frontend.

## Prerequisites
- **Node.js**: v18.x or higher
- **Backend API**: Running instance of the AssetFlow API

---

## 1. Local Development Setup

Follow these steps to run the React client locally:

### Step 1: Install Dependencies
Navigate to the `frontend/` directory and install dependencies:
```bash
cd frontend
npm install
```

### Step 2: Configure Environment
Copy the example environment template and populate it:
```bash
cp .env.example .env
```
*(Verify `VITE_API_BASE_URL` matches your running backend URL, e.g., `http://localhost:5000/api`)*.

### Step 3: Launch Dev Server
```bash
npm run dev
```
By default, the Vite server starts on `http://localhost:5173`. Open this URL in your web browser.

---

## 2. Production Deployment Setup

Vite compiles the React application into optimized static HTML, JS, and CSS files.

### Step 1: Compile Build
```bash
npm run build
```
This generates a static output directory named `dist/` in the frontend root.

### Step 2: Hosting the Static Files
The contents of the `dist/` directory can be deployed to any static site hosting service (e.g., Netlify, Vercel, AWS S3, Firebase Hosting, or a custom Nginx server).

#### Nginx Static Web Server Configuration
If deploying via Nginx, configure the virtual host to serve `index.html` for all route requests to support React Router SPA routing:
```nginx
server {
    listen 80;
    server_name assetflow.company.internal;

    root /var/www/assetflow/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
