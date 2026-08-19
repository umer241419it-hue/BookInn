#!/usr/bin/env bash
# ==============================================================================
# BookInn - Complete Automated AWS EC2 Deployment Script
# Target OS: Ubuntu 22.04 LTS (Jammy Jellyfish)
# Tech Stack: Node.js 22.x, MongoDB 8.x, PM2, Nginx, Express, React + Vite
# ==============================================================================

set -e

echo "=================================================="
echo "  Starting BookInn Automated Production Deployment"
echo "=================================================="

# ------------------------------------------------------------------------------
# 1. Root Check
# ------------------------------------------------------------------------------
if [ "$(id -u)" -ne 0 ]; then
    echo "[-] Error: This deployment script must be run as root." >&2
    echo "    Please run: sudo ./deploy.sh" >&2
    exit 1
fi
echo "[+] Root privileges verified."

# ------------------------------------------------------------------------------
# 2. Detect Non-Root EC2 User and Directories
# ------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -n "$SUDO_USER" ] && [ "$SUDO_USER" != "root" ]; then
    ACTUAL_USER="$SUDO_USER"
elif id -u ubuntu >/dev/null 2>&1; then
    ACTUAL_USER="ubuntu"
elif id -u ec2-user >/dev/null 2>&1; then
    ACTUAL_USER="ec2-user"
else
    ACTUAL_USER="$(logname 2>/dev/null || stat -c '%U' "$SCRIPT_DIR" 2>/dev/null || echo "ubuntu")"
fi

USER_HOME=$(getent passwd "$ACTUAL_USER" | cut -d: -f6)
if [ -z "$USER_HOME" ] || [ ! -d "$USER_HOME" ]; then
    USER_HOME="/home/$ACTUAL_USER"
fi

echo "[+] Detected EC2 User: $ACTUAL_USER (Home: $USER_HOME)"
echo "[+] Project Root: $SCRIPT_DIR"

BACKEND_DIR="$SCRIPT_DIR/hotel-backend"
FRONTEND_DIR="$SCRIPT_DIR/hotel-frontend"
WARNINGS=()

export DEBIAN_FRONTEND=noninteractive

# ------------------------------------------------------------------------------
# 3. System Packages & Repositories Installation
# ------------------------------------------------------------------------------
echo "[+] Updating apt package index..."
apt-get update -y -q

echo "[+] Installing core utilities (git, curl, nginx, gnupg, ca-certificates, build-essential)..."
apt-get install -y -q git curl nginx gnupg ca-certificates build-essential

# Node.js 22.x Setup (NodeSource)
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v22* ]]; then
    echo "[+] Configuring NodeSource repository for Node.js 22.x..."
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg --yes
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
    apt-get update -y -q
    apt-get install -y -q nodejs
fi
echo "[+] Node.js version: $(node -v)"
echo "[+] npm version: $(npm -v)"

# MongoDB 8.x & Tools Setup
if ! command -v mongod >/dev/null 2>&1; then
    echo "[+] Configuring MongoDB 8.0 Community repository..."
    mkdir -p /usr/share/keyrings
    curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg --yes
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-8.0.list
    apt-get update -y -q
    apt-get install -y -q mongodb-org mongodb-database-tools || apt-get install -y -q mongodb-org
fi

# PM2 Global Installation
if ! command -v pm2 >/dev/null 2>&1; then
    echo "[+] Installing PM2 process manager globally..."
    npm install -g pm2
fi

# ------------------------------------------------------------------------------
# 4 & 5. Service Management (MongoDB & Nginx)
# ------------------------------------------------------------------------------
echo "[+] Enabling and starting MongoDB..."
systemctl daemon-reload
systemctl enable mongod
systemctl restart mongod

echo "[+] Enabling and starting Nginx..."
systemctl enable nginx
systemctl restart nginx

# ------------------------------------------------------------------------------
# 6. Backend Dependencies Installation
# ------------------------------------------------------------------------------
echo "[+] Installing backend dependencies..."
if [ -d "$BACKEND_DIR" ]; then
    cd "$BACKEND_DIR"
    npm install
else
    echo "[-] Error: Backend directory $BACKEND_DIR not found!" >&2
    exit 1
fi

# ------------------------------------------------------------------------------
# 7. Configure Backend Environment (.env)
# ------------------------------------------------------------------------------
echo "[+] Configuring backend .env file..."
PORT_VAL="${PORT:-5000}"
MONGO_URI_VAL="${MONGO_URI:-mongodb://localhost:27017/bookinn}"

# Determine JWT Secret
if [ -n "$JWT_SECRET" ]; then
    JWT_SECRET_VAL="$JWT_SECRET"
elif [ -f "$BACKEND_DIR/.env" ] && grep -q '^JWT_SECRET=' "$BACKEND_DIR/.env" && [ -n "$(grep '^JWT_SECRET=' "$BACKEND_DIR/.env" | cut -d= -f2-)" ] && ! grep -q '^JWT_SECRET=change_this' "$BACKEND_DIR/.env"; then
    JWT_SECRET_VAL="$(grep '^JWT_SECRET=' "$BACKEND_DIR/.env" | cut -d= -f2-)"
else
    JWT_SECRET_VAL=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
fi

# Razorpay Keys
RAZORPAY_KEY_ID_VAL="${RAZORPAY_KEY_ID:-}"
RAZORPAY_KEY_SECRET_VAL="${RAZORPAY_KEY_SECRET:-}"

if [ -z "$RAZORPAY_KEY_ID_VAL" ] && [ -f "$BACKEND_DIR/.env" ]; then
    RAZORPAY_KEY_ID_VAL="$(grep '^RAZORPAY_KEY_ID=' "$BACKEND_DIR/.env" | cut -d= -f2- || true)"
    if [[ "$RAZORPAY_KEY_ID_VAL" == *"YOUR_KEY_ID"* ]]; then
        RAZORPAY_KEY_ID_VAL=""
    fi
fi

if [ -z "$RAZORPAY_KEY_SECRET_VAL" ] && [ -f "$BACKEND_DIR/.env" ]; then
    RAZORPAY_KEY_SECRET_VAL="$(grep '^RAZORPAY_KEY_SECRET=' "$BACKEND_DIR/.env" | cut -d= -f2- || true)"
    if [[ "$RAZORPAY_KEY_SECRET_VAL" == *"YOUR_KEY_SECRET"* ]]; then
        RAZORPAY_KEY_SECRET_VAL=""
    fi
fi

cat > "$BACKEND_DIR/.env" <<EOF
PORT=$PORT_VAL
MONGO_URI=$MONGO_URI_VAL
JWT_SECRET=$JWT_SECRET_VAL
RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID_VAL
RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET_VAL
EOF

chmod 600 "$BACKEND_DIR/.env"

if [ -z "$RAZORPAY_KEY_ID_VAL" ] || [ -z "$RAZORPAY_KEY_SECRET_VAL" ]; then
    WARNINGS+=("Razorpay API keys (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured. Online payments will not function until keys are added to hotel-backend/.env.")
fi

# ------------------------------------------------------------------------------
# 8. MongoDB Seed Data Import (Optional)
# ------------------------------------------------------------------------------
echo "[+] Checking for initial MongoDB seed data..."
SEED_IMPORTED=false

import_seed_data() {
    local file_path="$1"
    local collection_name="$2"
    if [ -f "$file_path" ]; then
        echo "[+] Importing seed data: $file_path -> collection: $collection_name"
        if command -v mongoimport >/dev/null 2>&1; then
            # Test if JSON array
            if head -n 5 "$file_path" | grep -q '^\s*\['; then
                mongoimport --db bookinn --collection "$collection_name" --file "$file_path" --jsonArray --mode=upsert 2>/dev/null || \
                mongoimport --db bookinn --collection "$collection_name" --file "$file_path" --jsonArray 2>/dev/null || true
            else
                mongoimport --db bookinn --collection "$collection_name" --file "$file_path" --mode=upsert 2>/dev/null || \
                mongoimport --db bookinn --collection "$collection_name" --file "$file_path" 2>/dev/null || true
            fi
            SEED_IMPORTED=true
        else
            echo "[-] mongoimport command not available; skipping seed import."
        fi
    fi
}

# Scan potential seed locations
SEED_DIRS=("$SCRIPT_DIR/BookInn-Migration" "$SCRIPT_DIR/seeds" "$SCRIPT_DIR/migration" "$SCRIPT_DIR/data")
for sdir in "${SEED_DIRS[@]}"; do
    if [ -d "$sdir" ]; then
        for jfile in "$sdir"/*.json; do
            if [ -f "$jfile" ]; then
                base=$(basename "$jfile" .json)
                coll=$(echo "$base" | sed -e 's/^bookinn\.//')
                import_seed_data "$jfile" "$coll"
            fi
        done
    fi
done

if [ "$SEED_IMPORTED" = false ]; then
    WARNINGS+=("No initial MongoDB JSON seed data found in migration/seed directories. Database 'bookinn' is initialized and ready for new data.")
fi

# ------------------------------------------------------------------------------
# 9. Frontend Dependencies, Environment & Production Build
# ------------------------------------------------------------------------------
echo "[+] Configuring and building frontend..."

# Detect Public IP dynamically
TOKEN=$(curl -s -S -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null || true)
PUBLIC_IP=""
if [ -n "$TOKEN" ]; then
    PUBLIC_IP=$(curl -s -S -H "X-aws-ec2-metadata-token: $TOKEN" "http://169.254.169.254/latest/meta-data/public-ipv4" 2>/dev/null || true)
fi

if [ -z "$PUBLIC_IP" ]; then
    PUBLIC_IP=$(curl -s --connect-timeout 3 https://checkip.amazonaws.com 2>/dev/null || curl -s --connect-timeout 3 https://ifconfig.me 2>/dev/null || echo "127.0.0.1")
fi

if [ -n "$VITE_API_URL" ]; then
    FRONTEND_API_URL="$VITE_API_URL"
elif [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "127.0.0.1" ]; then
    FRONTEND_API_URL="http://${PUBLIC_IP}/api"
else
    FRONTEND_API_URL="/api"
fi

if [ -d "$FRONTEND_DIR" ]; then
    cd "$FRONTEND_DIR"
    
    # Configure frontend .env
    cat > "$FRONTEND_DIR/.env" <<EOF
VITE_API_URL=$FRONTEND_API_URL
VITE_RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID_VAL
EOF
    
    npm install
    npm run build
else
    echo "[-] Error: Frontend directory $FRONTEND_DIR not found!" >&2
    exit 1
fi

# ------------------------------------------------------------------------------
# 10. Nginx Configuration & Permissions
# ------------------------------------------------------------------------------
echo "[+] Configuring Nginx reverse proxy and SPA routing..."

NGINX_CONF="/etc/nginx/sites-available/bookinn"
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $PUBLIC_IP localhost _;

    root $FRONTEND_DIR/dist;
    index index.html;

    # React Router SPA Handling
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Express Backend API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:$PORT_VAL/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static Asset Caching
    location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc|woff|woff2|ttf)\$ {
        expires 1M;
        access_log off;
        add_header Cache-Control "public";
    }
}
EOF

# Enable BookInn site and remove default site
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/bookinn
rm -f /etc/nginx/sites-enabled/default

# Set directory permissions for www-data traversal without world-writable risks
echo "[+] Setting safe directory permissions for Nginx and user..."
chmod 755 "$USER_HOME" 2>/dev/null || chmod o+x "$USER_HOME" || true
if [ -d "$USER_HOME/apps" ]; then
    chmod 755 "$USER_HOME/apps"
fi
chmod 755 "$SCRIPT_DIR"
chmod 755 "$FRONTEND_DIR"
chmod -R 755 "$FRONTEND_DIR/dist"

# Validate Nginx config
nginx -t
systemctl reload nginx

# ------------------------------------------------------------------------------
# 11. Start Backend with PM2
# ------------------------------------------------------------------------------
echo "[+] Starting backend with PM2 under user: $ACTUAL_USER..."

# Ensure ownership of project files
chown -R "$ACTUAL_USER:$ACTUAL_USER" "$SCRIPT_DIR"

# Stop existing instance if present and start new
sudo -u "$ACTUAL_USER" -i env PATH="$PATH" pm2 delete bookinn-backend 2>/dev/null || true
sudo -u "$ACTUAL_USER" -i env PATH="$PATH" bash -c "cd '$BACKEND_DIR' && pm2 start server.js --name bookinn-backend"
sudo -u "$ACTUAL_USER" -i env PATH="$PATH" pm2 save

# Setup PM2 systemd startup service
env PATH="$PATH" pm2 startup systemd -u "$ACTUAL_USER" --hp "$USER_HOME" --silent 2>/dev/null || true
sudo -u "$ACTUAL_USER" -i env PATH="$PATH" pm2 save

# ------------------------------------------------------------------------------
# 12. Validations & Health Checks (Strict Failure on Critical Issues)
# ------------------------------------------------------------------------------
echo "[+] Running deployment health checks..."

# Check MongoDB service
if ! systemctl is-active --quiet mongod; then
    echo "[-] CRITICAL: MongoDB service (mongod) is not active!" >&2
    systemctl status mongod --no-pager || true
    exit 1
fi
echo "[+] MongoDB service: ACTIVE"

# Check Nginx service
if ! systemctl is-active --quiet nginx; then
    echo "[-] CRITICAL: Nginx service is not active!" >&2
    systemctl status nginx --no-pager || true
    exit 1
fi
echo "[+] Nginx service: ACTIVE"

# Check PM2 backend process
PM2_STATUS=$(sudo -u "$ACTUAL_USER" -i env PATH="$PATH" pm2 jlist 2>/dev/null | grep -o '"name":"bookinn-backend","pm_id":[0-9]*,"monit":{[^}]*},"pm2_env":{"status":"online"' || true)
if [ -z "$PM2_STATUS" ]; then
    echo "[-] CRITICAL: PM2 process 'bookinn-backend' is not in online status!" >&2
    sudo -u "$ACTUAL_USER" -i env PATH="$PATH" pm2 status || true
    sudo -u "$ACTUAL_USER" -i env PATH="$PATH" pm2 logs bookinn-backend --lines 20 --nostream || true
    exit 1
fi
echo "[+] PM2 process 'bookinn-backend': ONLINE"

# Health check with retry loop (allowing Express DB connection to settle)
echo "[+] Verifying HTTP endpoints..."
BACKEND_OK=false
NGINX_API_OK=false
FRONTEND_OK=false

for i in {1..10}; do
    # Direct backend check
    HTTP_BACKEND=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT_VAL/api/rooms" 2>/dev/null || true)
    # Nginx API proxy check
    HTTP_API=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1/api/rooms" 2>/dev/null || true)
    # Nginx Frontend check
    HTTP_FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1/" 2>/dev/null || true)

    if [ "$HTTP_BACKEND" = "200" ]; then BACKEND_OK=true; fi
    if [ "$HTTP_API" = "200" ]; then NGINX_API_OK=true; fi
    if [ "$HTTP_FRONTEND" = "200" ]; then FRONTEND_OK=true; fi

    if [ "$BACKEND_OK" = true ] && [ "$NGINX_API_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
        break
    fi
    sleep 2
done

if [ "$BACKEND_OK" != true ]; then
    echo "[-] CRITICAL: Backend endpoint http://127.0.0.1:$PORT_VAL/api/rooms returned HTTP $HTTP_BACKEND (expected 200)!" >&2
    sudo -u "$ACTUAL_USER" -i env PATH="$PATH" pm2 logs bookinn-backend --lines 25 --nostream || true
    exit 1
fi
echo "[+] Backend endpoint check: OK (HTTP 200)"

if [ "$NGINX_API_OK" != true ]; then
    echo "[-] CRITICAL: Nginx reverse proxy endpoint http://127.0.0.1/api/rooms returned HTTP $HTTP_API (expected 200)!" >&2
    tail -n 25 /var/log/nginx/error.log || true
    exit 1
fi
echo "[+] Nginx API proxy check: OK (HTTP 200)"

if [ "$FRONTEND_OK" != true ]; then
    echo "[-] CRITICAL: Nginx frontend endpoint http://127.0.0.1/ returned HTTP $HTTP_FRONTEND (expected 200)!" >&2
    tail -n 25 /var/log/nginx/error.log || true
    exit 1
fi
echo "[+] Nginx frontend SPA check: OK (HTTP 200)"

DISPLAY_IP="$PUBLIC_IP"
if [ "$DISPLAY_IP" = "127.0.0.1" ] || [ "$DISPLAY_IP" = "_" ]; then
    DISPLAY_IP="<EC2_PUBLIC_IP>"
fi

# ------------------------------------------------------------------------------
# 13. Final Deployment Summary
# ------------------------------------------------------------------------------
echo ""
echo "========================================"
echo "BOOKINN DEPLOYMENT COMPLETE"
echo "========================================"
echo ""
echo "Frontend:"
echo "http://$DISPLAY_IP/"
echo ""
echo "Backend:"
echo "http://$DISPLAY_IP/api"
echo ""
echo "MongoDB:"
echo "localhost:27017/bookinn"
echo ""
echo "PM2:"
echo "bookinn-backend (online)"
echo ""
echo "Nginx:"
echo "active"
echo ""
echo "MongoDB:"
echo "active"
echo ""

if [ ${#WARNINGS[@]} -gt 0 ]; then
    echo "----------------------------------------"
    echo "NOTICES & WARNINGS:"
    for warn in "${WARNINGS[@]}"; do
        echo "  * $warn"
    done
    echo "----------------------------------------"
fi

echo "========================================"
echo "Deployment finished successfully!"
echo "========================================"
