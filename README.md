# FundPay 

> **Your investments. Your purchases. Your flexibility.**

FundPay is a full-stack fintech-style e-commerce application that lets users purchase products through flexible EMI plans backed by their investments.

The project combines a modern shopping experience with an EMI management workflow. Users can browse products, select variants, compare EMI plans, purchase a product, track their active EMIs, make installment payments, and view their purchase history.

---

## 🚀 Live Demo

**Frontend:** `https://fund-pay-five.vercel.app/`

**Backend API:** `https://fund-pay-backend.vercel.app/`

---

## 🎯 Project Objective

FundPay was built as a full-stack technical assignment with a focus on:

- Dynamic product data from a database
- RESTful APIs
- Multiple products and variants
- Multiple EMI plans per product
- Authentication and authorization
- EMI tracking and payment flows
- Responsive React UI
- Admin product management
- Cloud image uploads
- Production-ready deployment structure

The application does **not** rely on hardcoded product or EMI-plan data in the frontend. The frontend communicates with the backend through REST APIs, while MongoDB acts as the source of truth.

---

# ✨ Features

### 🛍️ Product Experience

- Browse all available products
- Search products by name, description, color, and storage
- View detailed product information
- Select different product variants
- Display MRP, selling price, discount, and product images
- Unique SEO-friendly product URLs using slugs

### 💳 EMI Experience

- Multiple EMI plans for each product
- Monthly EMI amount
- Tenure in months
- Interest rate
- Cashback
- Active/inactive EMI plans
- EMI plan selection before purchase
- EMI progress tracking
- Outstanding amount calculation
- Next installment date
- Pay individual EMI
- Pay remaining amount in full

### 🔐 Authentication

- Customer signup
- Customer signin
- JWT authentication
- Password hashing with bcrypt
- Protected customer routes
- Admin role-based access

### 👤 Customer Dashboard

- Active purchase overview
- EMI progress
- Amount paid
- Outstanding amount
- Remaining months
- Next installment
- Purchase history
- Completed purchases
- Individual EMI details

### 🛠️ Admin Dashboard

- Admin-only access
- Product management
- Product variant management
- Product image upload
- EMI-plan management

### ☁️ Image Management

Product images are uploaded using Cloudinary, while MongoDB stores the resulting image URLs.

### 📱 Responsive UI

The application is designed for:

- Desktop
- Laptop
- Tablet
- Mobile

---

# 🧰 Tech Stack

## Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type safety |
| Vite | Development and build tooling |
| React Router | Client-side routing |
| Axios | REST API communication |
| Tailwind CSS | Styling and responsive UI |
| Lucide React | Icons |

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | REST API |
| TypeScript | Type safety |
| Mongoose | MongoDB ODM |
| MongoDB Atlas | Database |
| JWT | Authentication |
| bcrypt | Password hashing |
| Zod | Validation |
| CORS | Cross-origin API access |

## External Services

- **MongoDB Atlas** — database
- **Cloudinary** — product image storage
- **Vercel** — deployment

---

# 🏗️ Architecture

```text
                         ┌───────────────────────┐
                         │     React Frontend     │
                         │   Vite + TypeScript    │
                         └───────────┬───────────┘
                                     │
                                  Axios
                                     │
                              REST API Requests
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    Express Backend     │
                         │   Node.js + TypeScript │
                         └───────────┬───────────┘
                                     │
                   ┌─────────────────┼─────────────────┐
                   │                 │                 │
                   ▼                 ▼                 ▼
              Auth / JWT        Controllers        Middleware
                   │                 │                 │
                   └─────────────────┼─────────────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │      MongoDB Atlas     │
                         │       Mongoose         │
                         └───────────────────────┘

                         Product Image Upload
                                  │
                                  ▼
                           ┌────────────┐
                           │ Cloudinary │
                           └────────────┘
```

---

# 📁 Project Structure

```text
fundpay/
│
├── client/
│   ├── public/
│   │   └── favicon.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Footer.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Navbar.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── EMIDetails.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── ProductDetails.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Signin.tsx
│   │   │   ├── Signup.tsx
│   │   │   └── UserDashboard.tsx
│   │   │
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── adminControllers/
│   │   │   │   └── admin.ts
│   │   │   ├── authControllers/
│   │   │   │   └── auth.ts
│   │   │   ├── customerControllers/
│   │   │   │   └── customer.ts
│   │   │   └── publicControllers/
│   │   │       └── products.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── middleware.ts
│   │   │   └── requireAdmin.ts
│   │   │
│   │   ├── models/
│   │   │   ├── EMIPlans.ts
│   │   │   ├── Products.ts
│   │   │   └── Users.ts
│   │   │
│   │   ├── routes/
│   │   │   └── route.ts
│   │   │
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── dist/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json
│
├── .gitignore
└── README.md
```

---

# 🧭 Application Routes

## Public Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/products` | Product catalogue |
| `/products/:slug` | Product details and EMI plans |
| `/signin` | Customer/admin sign in |
| `/signup` | Customer registration |

## Customer Routes

| Route | Description |
|---|---|
| `/dashboard` | Customer dashboard |
| `/dashboard/emi/:orderId` | EMI and payment details |

## Admin Route

| Route | Description |
|---|---|
| `/admin` | Admin dashboard |

---

# 🔄 User Flow

```text
                    Browse Products
                           │
                           ▼
                   Select Product
                           │
                           ▼
                  Select Variant
                           │
                           ▼
                  View EMI Plans
                           │
                           ▼
                   Select EMI Plan
                           │
                           ▼
                     Sign In
                    /       \
                  Yes        No
                   │          │
                   ▼          ▼
                 Create     Redirect
                  Order     to Sign In
                   │
                   ▼
              Order Created
                   │
                   ▼
             Customer Dashboard
                   │
             ┌─────┴─────┐
             ▼           ▼
          Pay EMI     Pay Full
             │           │
             └─────┬─────┘
                   ▼
             Order Completed
```

---

# 🛍️ Product Flow

Products are loaded from the backend:

```http
GET /api/v1/products
```

A product contains information such as:

```text
Product
├── name
├── slug
├── description
└── variants[]
    ├── color
    ├── storage
    ├── mrp
    ├── price
    ├── discount
    └── image
```

A unique slug is used for product URLs:

```text
/products/iphone-16
/products/samsung-galaxy-s25
```

---

# 💳 EMI Flow

EMI plans are associated with a product and loaded dynamically from the API.

Example:

```text
Product: Smartphone

EMI Plan 1
├── Tenure: 6 months
├── Monthly Amount: ₹X
├── Interest Rate: X%
└── Cashback: ₹X

EMI Plan 2
├── Tenure: 12 months
├── Monthly Amount: ₹X
├── Interest Rate: X%
└── Cashback: ₹X
```

The customer selects an EMI plan before placing the order.

---

# 🔐 Authentication & Authorization

FundPay uses JWT-based authentication.

## Signup

```http
POST /api/v1/auth/signup
```

The password is validated and hashed using bcrypt before being stored.

## Signin

```http
POST /api/v1/auth/signin
```

A successful signin returns:

- JWT token
- User ID
- User name
- Email
- Role

Protected requests use:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## Roles

### Customer

Customers can:

- Browse products
- Select variants
- View EMI plans
- Place orders
- View their dashboard
- Track EMI payments
- Pay EMIs
- Pay remaining amount in full
- View purchase history

### Admin

Admins can access protected admin functionality such as product management and image uploads.

Admin authorization is handled through role-based middleware.

---

# 🗄️ Database Design

FundPay uses MongoDB with Mongoose.

## User

```text
User
├── name
├── email
├── password
├── role
└── orders[]
```

Orders are embedded inside the user document for the current assignment architecture.

Each order stores references to:

```text
productId
variantId
emiPlanId
```

along with payment and installment information.

---

## Product

```text
Product
├── name
├── slug
├── description
└── variants[]
      ├── color
      ├── storage
      ├── mrp
      ├── price
      ├── discount
      └── image
```

---

## EMI Plan

```text
EMIPlan
├── productId
├── tenureMonths
├── monthlyAmount
├── interestRate
├── cashback
└── isActive
```

---

# 🔌 REST API

All routes are registered through the Express router in:

```text
server/src/routes/route.ts
```

The Express application mounts this router at `/api/v1`, so all API endpoints use the `/api/v1` base path:

## Health / Test

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/v1/test` | Public | Verify that the router is working |

## Authentication

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/signup` | Public | Create a customer account |
| POST | `/api/v1/auth/signin` | Public | Sign in and receive JWT |

## Products

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/v1/products` | Public | Fetch all products |
| GET | `/api/v1/products/:slug` | Public | Fetch a product by slug |

## EMI Plans

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/v1/emi-plans/product/:productId` | Public | Fetch active EMI plans for a product |

## Customer / Orders

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/v1/orders` | Customer | Create an order |
| GET | `/api/v1/orders` | Customer | Fetch the authenticated user's orders |
| POST | `/api/v1/orders/:orderId/pay-full` | Customer | Pay the remaining amount in full |
| POST | `/api/v1/orders/:orderId/pay-emi` | Customer | Pay one EMI |

## Admin — Products

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/v1/admin/products` | Admin | Create a product |
| PUT | `/api/v1/admin/products/:id` | Admin | Update a product |
| DELETE | `/api/v1/admin/products/:id` | Admin | Delete a product |

## Admin — EMI Plans

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/v1/admin/emi-plans` | Admin | Create an EMI plan |
| PATCH | `/api/v1/admin/emi-plans/:id/toggle` | Admin | Activate/deactivate an EMI plan |

### Authorization

Customer-protected routes use:

```http
Authorization: Bearer <JWT_TOKEN>
```

Admin routes use both:

```text
authMiddleware
      ↓
requireAdmin
```

so the request must contain a valid JWT and the authenticated user must have the `admin` role.

# 🧪 Order Creation

When the user proceeds with a purchase, the frontend sends:

```http
POST /api/v1/orders
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

Example request:

```json
{
  "productId": "PRODUCT_ID",
  "variantId": "VARIANT_ID",
  "emiPlanId": "EMI_PLAN_ID"
}
```

The backend validates:

```text
User exists
      ↓
Product exists
      ↓
Variant belongs to Product
      ↓
EMI Plan exists
      ↓
EMI Plan belongs to Product
      ↓
EMI Plan is active
      ↓
Create Order
```

This prevents invalid combinations of products, variants, and EMI plans.

---

# 💰 EMI Payment

For an EMI payment:

```http
POST /api/v1/orders/:orderId/pay-emi
```

The backend updates:

- `paidEMIs`
- `paidAmount`
- `nextInstallmentDate`
- `status`

When all installments are paid, the order becomes:

```text
completed
```

---

# 💵 Full Payment

For full payment:

```http
POST /api/v1/orders/:orderId/pay-full
```

The remaining EMI balance is calculated and the order is completed. The implementation uses the selected EMI plan attached to the order.

For this assignment implementation, an order is created with its selected EMI plan and the full-payment action then settles the remaining EMI balance.

---

# ☁️ Cloudinary Image Upload

Product images are uploaded to Cloudinary.

```text
Admin
  │
  ▼
React Frontend
  │
  │ Upload image
  ▼
Cloudinary
  │
  │ Image URL
  ▼
Backend
  │
  ▼
MongoDB
```

MongoDB stores the image URL rather than the image binary.

### Important

Do **not** expose the Cloudinary API secret in the frontend.

---

# ⚙️ Environment Variables

## Frontend

Create:

```text
client/.env
```

Add:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET=fundpay_products
```

For production:

```env
VITE_API_URL=YOUR_BACKEND_URL/api/v1
```

### Fill these:

| Variable | What to enter |
|---|---|
| `VITE_API_URL` | Your local or deployed backend API URL |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Your unsigned upload preset |

---

## Backend

Create:

```text
server/.env
```

Add:

```env
PORT=3000
MONGODB_URL=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/FundPay
JWT_PASSWORD=YOUR_STRONG_JWT_SECRET
```

### Fill these:

| Variable | What to enter |
|---|---|
| `PORT` | Local Express server port (3000) |
| `MONGODB_URL` | MongoDB Atlas connection string |
| `JWT_PASSWORD` | A long random secret used to sign and verify JWTs |

---

# 🧑‍💻 Local Development

## Prerequisites

Install:

- Node.js
- npm
- MongoDB Atlas account
- Cloudinary account

---

## 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd fundpay
```

---

## 2. Install frontend dependencies

```bash
cd client
npm install
```

Create `client/.env` and add the required values.

Start the frontend:

```bash
npm run dev
```

---

## 3. Install backend dependencies

Open a new terminal:

```bash
cd server
npm install
```

Create `server/.env` and add:

```env
PORT=3000
MONGODB_URL=YOUR_MONGODB_URI
JWT_PASSWORD=YOUR_JWT_SECRET
```

Start the backend:

```bash
npm run dev
```

# 🚀 Deployment

FundPay is structured as two Vercel projects from the same GitHub repository.

```text
GitHub
   │
   ├── client/ ───────────► Vercel Frontend
   │
   └── server/ ───────────► Vercel Backend
                                │
                                ▼
                          MongoDB Atlas
```


# 🧠 Key Engineering Decisions

## Database as the source of truth

Product, variant, EMI, and order information comes from the backend/database rather than being hardcoded in React.

## Slug-based product URLs

Products use:

```text
/products/:slug
```

which produces clean URLs such as:

```text
/products/iphone-17-pro-max
```

## Relationship validation

When an order is created, the backend verifies that the selected:

```text
Product
   ↓
Variant
   ↓
EMI Plan
```

are valid and belong together.

## Persisted EMI state

Payment progress is stored in MongoDB.

Refreshing the page does not reset:

- Paid EMIs
- Paid amount
- Remaining EMIs
- Next installment
- Order status

## Role-based authorization

Admin APIs are protected separately from customer APIs using the authenticated user's role.

## Embedded orders

Orders are currently embedded in the user document. This keeps the assignment architecture simple and makes retrieving a customer's purchases straightforward.

For a larger production system, a separate `Order` collection would be a natural evolution for independent indexing, reporting, scaling, and order management.

---

# 🔒 Security Considerations

FundPay currently implements:

- bcrypt password hashing
- JWT authentication
- Bearer-token authorization
- Admin role authorization
- Environment-based secrets
- Backend validation
- Product/variant/EMI relationship validation
- CORS configuration

For a production financial application, additional protections would be appropriate, including:

- Rate limiting
- Refresh-token/session strategy
- Payment-provider integration
- Idempotency keys
- Transaction handling
- Webhook verification
- Audit logs
- Stronger input validation
- Security headers
- Monitoring and alerting
- Automated tests

---


# 👨‍💻 Author

**Bhumesh Mahajan**

Full Stack Developer

---

<p align="center">
  <strong>FundPay</strong><br/>
  Your investments. Your purchases. Your flexibility.
</p>
