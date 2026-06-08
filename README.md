# StockChef API — Restaurant Inventory Management

NestJS backend for StockChef with full system design patterns.

## Quick Start
```bash
# 1. Start Postgres + Redis
sudo -u postgres psql -c "CREATE DATABASE stockchef;"

# 2. Install & run
npm install
cp .env.example .env
npm run start:dev

# Swagger docs → http://localhost:3000/docs
```

## Roles
| Role | Access |
|---|---|
| **admin** | Full access — CRUD everything, manage users, receive orders |
| **staff** | View items, record stock movements, record sales |
| **supplier** | View purchase orders directed at them |

## Modules
| Module | Endpoint | Description |
|---|---|---|
| Auth | `/auth` | Register / Login with JWT |
| Categories | `/categories` | Ingredient categories |
| Suppliers | `/suppliers` | Supplier management |
| Items | `/items` | Inventory items with low-stock filter |
| Purchase Orders | `/purchase-orders` | Draft → Send → Receive (auto-updates stock) |
| Stock Movements | `/stock-movements` | Full audit trail (IN/OUT/adjustment) |
| Sales | `/sales` | Record sales — auto-deducts stock |
| Reports | `/reports` | Dashboard KPIs, revenue, low-stock, top items |
| Health | `/health` | DB + memory + uptime |

## System Design Patterns
- JWT Auth + RBAC (3 roles)
- Cache-aside with in-memory cache
- BullMQ background jobs (low-stock alerts)
- Database transactions (receive orders, record sales)
- Global exception filter + response envelope
- Correlation ID middleware
- Rate limiting (120 req/min)
- Graceful shutdown
