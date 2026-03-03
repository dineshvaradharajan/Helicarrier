#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
#  Helicarrier — Setup Script
#  Sets up the full development environment from scratch.
#  Usage: ./setup.sh
# ─────────────────────────────────────────────────────────────

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $1"; exit 1; }

echo ""
echo -e "${BOLD}⬡  HELICARRIER — Development Setup${NC}"
echo "───────────────────────────────────────"
echo ""

# ─── 1. Check prerequisites ───────────────────────────────────

info "Checking prerequisites..."

# Node.js
if ! command -v node &> /dev/null; then
  fail "Node.js is not installed. Install Node.js >= 20 from https://nodejs.org"
fi
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  fail "Node.js >= 20 required. Found: $(node -v)"
fi
ok "Node.js $(node -v)"

# pnpm
if ! command -v pnpm &> /dev/null; then
  warn "pnpm not found. Installing..."
  npm install -g pnpm@9
  ok "pnpm installed"
else
  ok "pnpm $(pnpm -v)"
fi

# Docker
if ! command -v docker &> /dev/null; then
  fail "Docker is not installed. Install Docker from https://docker.com"
fi
ok "Docker $(docker --version | awk '{print $3}' | tr -d ',')"

# Docker Compose
if ! docker compose version &> /dev/null; then
  fail "Docker Compose is not available. Install Docker Desktop or docker-compose."
fi
ok "Docker Compose available"

echo ""

# ─── 2. Environment file ──────────────────────────────────────

info "Setting up environment..."

if [ -f .env ]; then
  warn ".env already exists — skipping (delete it to regenerate)"
else
  AUTH_SECRET=$(openssl rand -base64 32)
  cat > .env <<EOL
DATABASE_URL=postgresql://helicarrier:helicarrier@localhost:5432/helicarrier
AUTH_SECRET=${AUTH_SECRET}
AUTH_URL=http://localhost:3000
HELICARRIER_API_URL=http://localhost:3000/api/v1
EOL
  ok ".env created with generated AUTH_SECRET"
fi

# Symlink .env to apps/web if not already linked
if [ ! -e apps/web/.env ]; then
  ln -sf ../../.env apps/web/.env
  ok "Symlinked apps/web/.env → ../../.env"
else
  ok "apps/web/.env already exists"
fi

echo ""

# ─── 3. Install dependencies ──────────────────────────────────

info "Installing dependencies..."
pnpm install
ok "Dependencies installed"

echo ""

# ─── 4. Start PostgreSQL ──────────────────────────────────────

info "Starting PostgreSQL via Docker Compose..."
docker compose up -d
ok "PostgreSQL running on port 5432"

# Wait for PostgreSQL to be ready
info "Waiting for PostgreSQL to accept connections..."
RETRIES=30
until docker compose exec -T postgres pg_isready -U helicarrier -q 2>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -le 0 ]; then
    fail "PostgreSQL did not become ready in time"
  fi
  sleep 1
done
ok "PostgreSQL is ready"

echo ""

# ─── 5. Build packages ────────────────────────────────────────

info "Building all packages..."
pnpm build
ok "All packages built"

echo ""

# ─── 6. Run database migrations ───────────────────────────────

info "Applying database schema..."
pnpm --filter @helicarrier/db migrate
ok "Database schema applied"

echo ""

# ─── 7. Seed database ─────────────────────────────────────────

info "Seeding database with default data..."
pnpm --filter @helicarrier/db seed
ok "Database seeded"

echo ""

# ─── 8. Done ──────────────────────────────────────────────────

echo "───────────────────────────────────────"
echo ""
echo -e "${GREEN}${BOLD}✓ Setup complete!${NC}"
echo ""
echo -e "  Start the dashboard:    ${CYAN}pnpm --filter @helicarrier/web dev${NC}"
echo -e "  Open in browser:        ${CYAN}http://localhost:3000${NC}"
echo ""
echo -e "  Login credentials:"
echo -e "    Email:     ${BOLD}admin@helicarrier.dev${NC}"
echo -e "    Password:  ${BOLD}admin${NC}"
echo ""
echo -e "  Admin API key (dev):    ${BOLD}hc_dev_admin_key_12345${NC}"
echo ""
echo -e "  Other commands:"
echo -e "    ${CYAN}pnpm build${NC}                        Build all packages"
echo -e "    ${CYAN}pnpm --filter @helicarrier/db studio${NC}  Open Drizzle Studio"
echo -e "    ${CYAN}docker compose down${NC}               Stop PostgreSQL"
echo ""
