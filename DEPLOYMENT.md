# Deployment Guide for shadi.org.uk

This guide walks you through deploying the complete application (Frontend, FastAPI Backend, PostgreSQL Database, Redis, Nginx Reverse Proxy with SSL) to your server for your domain **shadi.org.uk**.

---

## 📋 Overview of Changes Made

1. **Dynamic Image & Asset URLs**: Removed all hardcoded `http://localhost:8000` URLs across all frontend pages (`Search.jsx`, `Dashboard.jsx`, `ProfileDetails.jsx`, `AdminDashboard.jsx`, `ImageUpload.jsx`) and replaced them with dynamic domain resolution via `getImageUrl()`.
2. **Reverse Proxy Configuration (`nginx.conf`)**:
   - `/` serves the compiled React Vite SPA.
   - `/api/` proxies securely to the FastAPI backend (`backend:8000`).
   - `/static/uploads/` proxies uploaded profile photos and CNICs.
   - `client_max_body_size` increased to 25MB for image and document uploads.
3. **CORS & Origin Security**:
   - Updated `backend/main.py` to support `ALLOWED_ORIGINS` with `https://shadi.org.uk` and `https://www.shadi.org.uk`.
4. **Isolated Docker Networking**:
   - Port `8000` is internal to the Docker network; only standard web ports (80 for HTTP and 443 for HTTPS) are exposed to the public.
   - Added persistent volume `uploads_prod` so user uploaded images are never lost on container restarts.

---

## 🛠 Step 1: Point Your Domain DNS to Your Server

Log in to your domain registrar (e.g., GoDaddy, Namecheap, 123 Reg, Cloudflare):

| Type | Name / Host | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `YOUR_SERVER_PUBLIC_IP` | Automatic / 300s |
| **A** (or CNAME) | `www` | `YOUR_SERVER_PUBLIC_IP` (or `shadi.org.uk`) | Automatic / 300s |

*(Wait a few minutes for DNS propagation. You can verify using `ping shadi.org.uk`)*

---

## 🚀 Step 2: Server Setup (Ubuntu VPS e.g. DigitalOcean, Hetzner, AWS)

Connect to your server via SSH:

```bash
ssh root@YOUR_SERVER_IP
```

### 1. Update and install Docker & Docker Compose:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Enable Docker service
sudo systemctl enable --now docker
```

### 2. Configure Firewall (UFW):
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📦 Step 3: Clone Code & Configure Environment

### 1. Clone repository on the server:
```bash
git clone <YOUR_GIT_REPO_URL> /var/www/shadi
cd /var/www/shadi
```

### 2. Create the production `.env` file:
```bash
cp .env.production.example .env
nano .env
```

Ensure you update:
- `POSTGRES_PASSWORD`: A secure random password
- `SECRET_KEY`: Generate a random key using `openssl rand -hex 32`

---

## 🔒 Step 4: Issue Free SSL Certificate (Let's Encrypt)

### Option A: Automatic SSL with Certbot (Recommended)

1. Install Certbot on the server:
   ```bash
   sudo apt install -y certbot
   ```

2. Generate certificates for `shadi.org.uk` and `www.shadi.org.uk`:
   ```bash
   sudo certbot certonly --standalone -d shadi.org.uk -d www.shadi.org.uk --email your-email@gmail.com --agree-tos --non-interactive
   ```

3. Copy the SSL Nginx config into `frontend/nginx.conf`:
   ```bash
   cp frontend/nginx.ssl.conf frontend/nginx.conf
   ```

4. Mount certificates into the frontend container in `docker-compose.prod.yml`:
   ```yaml
   frontend:
     volumes:
       - /etc/letsencrypt:/etc/letsencrypt:ro
   ```

---

## ⚡ Step 5: Launch the Application

Run the production Docker Compose command:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Check the running containers:
```bash
docker compose -f docker-compose.prod.yml ps
```

View live logs:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

---

## 🔄 Step 6: Database Initialization & Super Admin

The Super Admin user is automatically created with the phone number and credentials configured in `backend/main.py`:
- **Phone**: `+920000000000`
- **Password**: `SuperSecretAdminPassword123!`

*(Make sure to log in to the admin panel at `https://shadi.org.uk/login` and change your super admin password from the dashboard!)*

