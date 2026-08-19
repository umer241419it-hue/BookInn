# BookInn — Hotel Management System

BookInn is a full-stack MERN (MongoDB, Express, React, Node.js) hotel management application featuring room browsing, reservations, JWT authentication, and Razorpay payment processing.

---

## 🚀 Automated Deployment on Fresh AWS EC2

This repository includes a fully automated, idempotent production deployment script ([`deploy.sh`](deploy.sh)) tailored for a fresh **Ubuntu 22.04 LTS** EC2 instance.

### 1. EC2 Instance Requirements
- **Operating System:** Ubuntu 22.04 LTS (Jammy Jellyfish)
- **Instance Type:** `t3.small` / `t2.medium` (Minimum 1 GB RAM, 2 GB+ recommended for React build)
- **Security Group Inbound Rules:**
  - **HTTP (Port 80):** `0.0.0.0/0` (Public web access)
  - **HTTPS (Port 443):** `0.0.0.0/0` (SSL/TLS access)
  - **SSH (Port 22):** Your IP (For terminal administration)
  - *Note: Backend (port 5000) and MongoDB (port 27017) are internal and do not need to be opened.*

---

### 2. Deployment Methods

#### Method A: 1-Click Zero-SSH Launch (via AWS EC2 User Data)
When launching an EC2 instance in the AWS Console, paste the following into the **User Data** field under **Advanced Details**:

```bash
#!/bin/bash
set -e

# Target application directory
APP_DIR="/home/ubuntu/apps/BookInn"
REPO_URL="https://github.com/umer241419it-hue/BookInn.git"

# Optional deployment variables (Fill in with your actual keys if available)
export RAZORPAY_KEY_ID=""
export RAZORPAY_KEY_SECRET=""
export JWT_SECRET=""

# Prepare directory
mkdir -p /home/ubuntu/apps
chown -R ubuntu:ubuntu /home/ubuntu/apps

# Clone repository
if [ ! -d "$APP_DIR/.git" ]; then
    sudo -u ubuntu git clone "$REPO_URL" "$APP_DIR"
else
    cd "$APP_DIR"
    sudo -u ubuntu git pull origin main
fi

# Run deployment
cd "$APP_DIR"
chmod +x deploy.sh
sudo -E ./deploy.sh
```

#### Method B: Manual SSH Deployment
Connect to your EC2 instance via SSH and run:

```bash
mkdir -p /home/ubuntu/apps
cd /home/ubuntu/apps
git clone https://github.com/umer241419it-hue/BookInn.git
cd BookInn
chmod +x deploy.sh
sudo ./deploy.sh
```

To provide environment variables during manual deployment:
```bash
sudo RAZORPAY_KEY_ID="rzp_test_xxxx" RAZORPAY_KEY_SECRET="yyyy" ./deploy.sh
```

---

## ⚙️ How the Deployment Works

[`deploy.sh`](deploy.sh) executes the following tasks non-interactively:

1. **Root Verification & User Detection:** Validates root permissions while detecting the unprivileged EC2 user (`ubuntu`) for PM2 process ownership and file security.
2. **System Dependencies:**
   - Installs `git`, `curl`, `nginx`, `gnupg`, `ca-certificates`, and `build-essential`.
   - Installs **Node.js 22.x** and `npm` via the official NodeSource repository.
   - Installs **MongoDB 8.0 Community Edition** & Database Tools (`mongoimport`).
   - Installs **PM2** globally.
3. **Database Initialization:**
   - Enables and starts `mongod`.
   - Imports seed JSON data if present in migration folders (supporting both JSON array and NDJSON formats).
4. **Backend Setup:**
   - Installs backend dependencies in `hotel-backend`.
   - Generates a secure cryptographic `JWT_SECRET` (if none supplied) and populates `hotel-backend/.env`.
   - Starts Express with **PM2** under `bookinn-backend` and configures systemd reboot persistence (`pm2 startup`).
5. **Frontend Setup & Build:**
   - Dynamically determines the EC2 public IP via AWS IMDSv2 metadata.
   - Configures `hotel-frontend/.env` with `VITE_API_URL=http://<EC2_PUBLIC_IP>/api` (or `/api`).
   - Installs dependencies and runs `npm run build`.
6. **Nginx Reverse Proxy & Permissions:**
   - Serves React SPA from `hotel-frontend/dist` with `try_files $uri $uri/ /index.html;`.
   - Proxies `/api/` to `http://127.0.0.1:5000/api/`.
   - Applies `755` permissions across parent folders so Nginx (`www-data`) avoids 403 Forbidden errors.
7. **Strict Health Checks:**
   - Validates `mongod`, `nginx`, PM2 process state, and HTTP endpoints (`http://127.0.0.1/api/rooms`, `http://127.0.0.1/`).
   - Fails immediately with diagnostic logs if critical components are non-responsive.

---

## 🔑 Environment Variables

### Backend Configuration (`hotel-backend/.env`)
Template provided in [`hotel-backend/.env.example`](hotel-backend/.env.example) and [`.env.example`](.env.example):

| Variable | Description | Default / Fallback |
| :--- | :--- | :--- |
| `PORT` | Port Express listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/bookinn` |
| `JWT_SECRET` | Secret key for JWT auth | *Auto-generated 32-byte hex* |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | *Optional / configurable* |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | *Optional / configurable* |

### Frontend Configuration (`hotel-frontend/.env`)
Template provided in [`hotel-frontend/.env.example`](hotel-frontend/.env.example):

| Variable | Description | Default / Production Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API endpoint | `http://<EC2_PUBLIC_IP>/api` or `/api` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Key ID for client modal | *Optional / matches backend* |

---

## 🔄 How to Redeploy / Update

`deploy.sh` is completely **idempotent**. Running it again updates and rebuilds without duplicating processes or wiping configuration:

```bash
cd /home/ubuntu/apps/BookInn
git pull origin main
sudo ./deploy.sh
```

---

## 🔍 Monitoring and Logs

### PM2 Backend Logs
```bash
# View live backend logs
pm2 logs bookinn-backend

# View process status
pm2 status

# Restart backend process
pm2 restart bookinn-backend
```

### Nginx Logs
```bash
# Live error log
sudo tail -f /var/log/nginx/error.log

# Live access log
sudo tail -f /var/log/nginx/access.log

# Test configuration syntax
sudo nginx -t
```

### MongoDB Service
```bash
# Service status
sudo systemctl status mongod

# Service logs
sudo journalctl -u mongod -n 50 --no-pager
```

---

## 🗄️ MongoDB Seed Data Import

If you have exported JSON seed data:

```bash
# JSON array format (e.g., [ {...}, {...} ])
mongoimport --db bookinn --collection users --file BookInn-Migration/bookinn.users.json --jsonArray --mode=upsert
mongoimport --db bookinn --collection rooms --file BookInn-Migration/bookinn.rooms.json --jsonArray --mode=upsert
mongoimport --db bookinn --collection bookings --file BookInn-Migration/bookinn.bookings.json --jsonArray --mode=upsert

# Newline-delimited JSON format (NDJSON)
mongoimport --db bookinn --collection rooms --file rooms.ndjson --mode=upsert
```
