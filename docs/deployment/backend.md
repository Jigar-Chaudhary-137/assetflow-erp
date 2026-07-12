# Deployment: Backend Setup

Guide to configuring and launching the Node.js + Express backend.

## Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local server (v6.x+) or MongoDB Atlas account

---

## 1. Local Development Setup

Follow these steps to run the API server locally:

### Step 1: Install Dependencies
Navigate to the `backend/` directory and install required npm packages:
```bash
cd backend
npm install
```

### Step 2: Configure Environment
Copy the example environment template and populate it with your local configurations:
```bash
cp .env.example .env
```
*(Configure `MONGODB_URI` to point to your local instance, e.g., `mongodb://localhost:27017/assetflow`)*.

### Step 3: Seed MongoDB Database
To import base categories, departments, users, and assets:
```bash
# In the database/ folder
mongoimport --db assetflow --collection categories --file seed/categories.json --jsonArray --mode merge
mongoimport --db assetflow --collection departments --file seed/departments.json --jsonArray --mode merge
mongoimport --db assetflow --collection users --file seed/users.json --jsonArray --mode merge
mongoimport --db assetflow --collection assets --file seed/assets.json --jsonArray --mode merge
```

### Step 4: Run Development Server
```bash
npm run dev
```
The server will start on the port configured in `.env` (default: `http://localhost:5000`).

---

## 2. Production Deployment Setup

For deployment to a VPS (e.g. AWS EC2, DigitalOcean):

### Step 1: Install Production Dependencies Only
```bash
npm install --omit=dev
```

### Step 2: Set Production Environment Variables
Set real environment variables on the hosting platform or write them to a production `.env` file, ensuring `NODE_ENV=production` and `JWT_SECRET` is secured.

### Step 3: Start Server with Process Manager (PM2)
To keep the Node.js API process running continuously in the background:
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name "assetflow-api"

# Configure PM2 to start on system boot
pm2 startup
pm2 save
```
