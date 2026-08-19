# BookInn — Hotel Management System

BookInn is a full-stack MERN (MongoDB, Express, React, Node.js) hotel management application featuring room browsing, reservations, JWT authentication, and Razorpay payment processing.

---

## 🚀 Quick Automated Deployment on AWS EC2

This repository includes a fully automated, idempotent production deployment script (`deploy.sh`) tailored for a fresh **Ubuntu 22.04 LTS** EC2 instance.

### 1. EC2 Instance Configuration
- **Operating System:** Ubuntu 22.04 LTS (Jammy Jellyfish)
- **Instance Type:** `t3.small` / `t2.medium` (minimum 1 GB RAM, 2 GB+ recommended for React build)
- **Security Group Inbound Rules:**
  - **HTTP (Port 80):** `0.0.0.0/0` (Mandatory for web access)
  - **HTTPS (Port 443):** `0.0.0.0/0` (For SSL/TLS)
  - **SSH (Port 22):** Your IP (For administration)
  - *Note: Backend port 5000 and MongoDB port 27017 are internal and do not need to be exposed publicly.*

---

### 2. Deployment Methods

#### Method A: 1-Click Zero-SSH Launch (via EC2 User Data)
When launching an EC2 instance, paste the following into the **User Data** field under **Advanced Details**:

```bash
#!/bin/bash
# Pass optional environment variables
export RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"
export RAZORPAY_KEY_SECRET="YOUR_RAZORPAY_SECRET"
# export JWT_SECRET="your_custom_jwt_secret" # Optional: auto-generated if omitted

cd /home/ubuntu
git clone https://github.com/umer241419it-hue/BookInn.git
cd BookInn
chmod +x deploy.sh
sudo -E ./deploy.sh
```

#### Method B: Manual SSH Deployment
Connect to your EC2 instance via SSH and run:

```bash
git clone https://github.com/umer241419it-hue/BookInn.git
cd BookInn
chmod +x deploy.sh
sudo ./deploy.sh
```

To provide Razorpay credentials during manual deployment:
```bash
sudo RAZORPAY_KEY_ID="rzp_test_xxxx" RAZORPAY_KEY_SECRET="yyyy" ./deploy.sh
```

---

## ⚙️ How the Deployment Works

The automated script [`deploy.sh`](deploy.sh) executes the following tasks:

1. **Root Verification & User Detection:** Validates root permissions while detecting the unprivileged EC2 user (`ubuntu`) for safe process execution.
2. **Dependency Installation:**
   - Core tools: `git`, `curl`, `nginx`, `gnupg`, `ca-certificates`, `build-essential`
   - **Node.js 22.x** and `npm` via the official NodeSource repository
   - **MongoDB 8.0 Community Edition** & Database Tools (`mongoimport`)
   - **PM2** Process Manager globally installed
3. **Database Initialization:**
   - Enables and starts the `mongod` system service.
   - Automatically scans and imports initial seed data (e.g. `BookInn-Migration/*.json`) if available.
4. **Backend Setup:**
   - Installs dependencies in `hotel-backend`.
   - Generates a secure cryptographic `JWT_SECRET` (if none provided) and populates `hotel-backend/.env`.
   - Starts Express with **PM2** under `bookinn-backend` and enables systemd boot persistence (`pm2 startup`).
5. **Frontend Setup & Build:**
   - Configures `hotel-frontend/.env` with `VITE_API_URL=/api`.
   - Installs dependencies and runs `npm run build` to produce production assets in `hotel-frontend/dist`.
6. **Nginx Reverse Proxy & Permissions:**
   - Configures Nginx on Port 80 with SPA fallback routing (`try_files $uri $uri/ /index.html;`).
   - Proxies `/api/` traffic directly to the Express backend (`http://127.0.0.1:5000/api/`).
   - Fixes directory permissions so Nginx (`www-data`) can read `/dist` without 403 Forbidden errors.
7. **Automated Health Checks:**
   - Validates MongoDB status, Nginx status, PM2 process state, and HTTP endpoints.
   - Outputs a deployment summary banner with access URLs.

---

## 🔑 Environment Variables

The backend configuration is managed in `hotel-backend/.env`. A template is provided in [`.env.example`](.env.example):

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port Express listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/bookinn` |
| `JWT_SECRET` | Secret key for JWT auth | *Auto-generated random hex string* |
| `RAZORPAY_KEY_ID` | Razorpay key for payments | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | `...` |

---

## 🔄 How to Redeploy / Update

The `deploy.sh` script is completely **idempotent**. To pull the latest updates and re-deploy:

```bash
cd /home/ubuntu/BookInn
git pull origin main
sudo ./deploy.sh
```

Existing secrets stored in `hotel-backend/.env` (such as `JWT_SECRET` and Razorpay keys) are preserved across redeployments unless explicitly overridden.

---

## 📝 Updating Razorpay Keys Post-Deployment

If you deployed without Razorpay keys or need to update them:

1. Edit the backend `.env` file:
   ```bash
   nano hotel-backend/.env
   ```
2. Update the keys:
   ```env
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```
3. Restart the backend process:
   ```bash
   pm2 restart bookinn-backend
   ```

---

## 🗄️ Importing MongoDB Seed Data

Initial seed data located in `BookInn-Migration/`, `seeds/`, or `data/` is automatically imported during deployment.

To manually import JSON data at any time:

```bash
# JSON Array format (e.g. [ {...}, {...} ])
mongoimport --db bookinn --collection users --file BookInn-Migration/bookinn.users.json --jsonArray --mode=upsert
mongoimport --db bookinn --collection rooms --file BookInn-Migration/bookinn.rooms.json --jsonArray --mode=upsert
mongoimport --db bookinn --collection bookings --file BookInn-Migration/bookinn.bookings.json --jsonArray --mode=upsert

# Newline-delimited JSON format (NDJSON)
mongoimport --db bookinn --collection rooms --file rooms.ndjson --mode=upsert
```

---

## 🔍 Monitoring and Logs

### Check Backend Application Logs (PM2)
```bash
# Realtime log stream
pm2 logs bookinn-backend

# PM2 status dashboard
pm2 status
```

### Check Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t
```

### Check MongoDB Service
```bash
sudo systemctl status mongod
sudo journalctl -u mongod -n 50 --no-pager
```
