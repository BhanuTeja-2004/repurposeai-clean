# RepurposeAI — Complete Setup & Deployment Guide

---

## Project Overview

RepurposeAI is a full-stack SaaS platform that transforms long-form content into platform-optimized posts using AI (GPT-4o mini). It includes authentication, usage limits, history, a dashboard, and Stripe payments.

---

## Folder Structure

```
repurpose-ai/
├── backend/                          # Spring Boot (Java 17)
│   ├── pom.xml
│   └── src/main/java/com/repurposeai/
│       ├── RepurposeAiApplication.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── ContentController.java
│       │   ├── UserController.java
│       │   └── PaymentController.java
│       ├── service/
│       │   ├── AuthService.java
│       │   ├── ContentService.java
│       │   ├── OpenAiService.java
│       │   └── PaymentService.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   └── GeneratedContentRepository.java
│       ├── model/
│       │   ├── User.java
│       │   └── GeneratedContent.java
│       ├── dto/                      # All request/response DTOs
│       ├── security/                 # JWT filter, UserDetailsService
│       ├── config/                   # SecurityConfig
│       └── exception/                # GlobalExceptionHandler + exceptions
│
├── frontend/                         # React + Vite
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── services/api.js
│       ├── store/authStore.js
│       ├── styles/globals.css
│       └── components/
│           ├── LandingPage.jsx
│           ├── auth/LoginPage.jsx
│           ├── auth/RegisterPage.jsx
│           ├── layout/AppLayout.jsx
│           ├── generate/GeneratePage.jsx
│           ├── history/HistoryPage.jsx
│           ├── dashboard/DashboardPage.jsx
│           └── payment/PricingPage.jsx
│
└── database/
    └── schema.sql
```

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login, returns JWT |

### Content
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/content/generate | ✅ | Generate AI content |
| GET | /api/content/history | ✅ | Paginated history |
| GET | /api/content/{id} | ✅ | Get content by ID |
| DELETE | /api/content/{id} | ✅ | Delete content |
| GET | /api/content/{id}/download | ✅ | Download as .txt |
| GET | /api/content/dashboard | ✅ | Dashboard stats |
| GET | /api/content/output-types | ✅ | List all output types |

### User
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/users/me | ✅ | Get profile |
| PUT | /api/users/me/name | ✅ | Update name |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/payments/checkout | ✅ | Create Stripe checkout |
| POST | /api/payments/webhook | ❌ | Stripe webhook handler |
| POST | /api/payments/cancel | ✅ | Cancel subscription |

---

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8.0+
- OpenAI API key
- Stripe account (for payments)

---

## Step 1 — MySQL Setup

```sql
-- Create database
CREATE DATABASE repurpose_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Run schema
mysql -u root -p repurpose_ai < database/schema.sql
```

---

## Step 2 — Backend Setup

### Configure environment variables

Create a `.env` file or export these before running:

```bash
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
export JWT_SECRET=your-very-long-secret-key-minimum-32-chars
export OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
export STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
export STRIPE_PRICE_ID_PRO=price_xxxxxxxxxxxxxxxxxxxx
```

### Build & run

```bash
cd backend
mvn clean package -DskipTests
java -jar target/repurpose-ai-backend-1.0.0.jar

# Or for development:
mvn spring-boot:run
```

Backend runs on: http://localhost:8080/api

---

## Step 3 — Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

For production build:
```bash
npm run build
# Outputs to frontend/dist/
```

---

## Step 4 — Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Create a product: "RepurposeAI Pro"
3. Create a recurring price: $19/month
4. Copy the Price ID to `STRIPE_PRICE_ID_PRO`
5. Set up webhook endpoint in Stripe dashboard:
   - URL: `https://yourdomain.com/api/payments/webhook`
   - Events to listen: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
6. Copy Webhook Signing Secret to `STRIPE_WEBHOOK_SECRET`

For local testing with Stripe CLI:
```bash
stripe listen --forward-to localhost:8080/api/payments/webhook
```

---

## Step 5 — Production Deployment

### Backend — Deploy to Railway / Render / VPS

**Option A — JAR deploy:**
```bash
mvn clean package
# Upload target/*.jar to server
java -Xmx512m -jar repurpose-ai-backend-1.0.0.jar \
  --spring.datasource.url=jdbc:mysql://your-db-host:3306/repurpose_ai \
  --spring.datasource.username=prod_user \
  --spring.datasource.password=prod_pass
```

**Option B — Dockerfile:**
```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/repurpose-ai-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-Xmx512m","-jar","app.jar"]
```

### Frontend — Deploy to Vercel / Netlify

```bash
# Install Vercel CLI
npm i -g vercel

cd frontend
npm run build
vercel --prod
```

Update `vite.config.js` proxy target with your production backend URL, or set `VITE_API_BASE=https://api.yourdomain.com` and update `api.js`.

### CORS Update

In `application.properties`, update:
```
app.cors.allowed-origins=https://yourdomain.com
```

---

## Step 6 — Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| DB_USERNAME | ✅ | MySQL username |
| DB_PASSWORD | ✅ | MySQL password |
| JWT_SECRET | ✅ | Min 32 char secret |
| OPENAI_API_KEY | ✅ | From platform.openai.com |
| STRIPE_SECRET_KEY | ✅ | From Stripe dashboard |
| STRIPE_WEBHOOK_SECRET | ✅ | From Stripe webhook setup |
| STRIPE_PRICE_ID_PRO | ✅ | Your $19/month price ID |

---

## Test Credentials (from seed data)

| Email | Password | Plan |
|-------|----------|------|
| admin@repurposeai.com | Test@1234 | PRO |
| demo@repurposeai.com | Test@1234 | FREE |

---

## Architecture Notes

- JWT tokens expire after 24 hours
- Daily usage resets at midnight (scheduled job)
- Free plan: 3 generations/day enforced server-side
- Pro plan: 999,999 generations/day (effectively unlimited)
- Content is stored indefinitely for Pro users
- Stripe webhooks handle plan upgrades/downgrades automatically
- All inputs validated server-side with Bean Validation
- Passwords hashed with BCrypt (strength 12)

---

## Scaling Checklist

- [ ] Add Redis for rate limiting (replace DB-based daily counter)
- [ ] Add connection pooling (HikariCP is included by default)
- [ ] Add CDN for frontend assets
- [ ] Set up database replicas for reads
- [ ] Add monitoring (Prometheus + Grafana)
- [ ] Add email verification (Spring Mail)
- [ ] Add admin dashboard endpoint
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate` in production
