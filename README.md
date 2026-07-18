# 🚀 Freelance Marketplace API

A robust, secure, and fully-featured RESTful API for a Freelance Marketplace platform built with the Node.js ecosystem. This project strictly follows the **MVC (Model-View-Controller)** architecture and implements industry-standard best practices, including role-based access control, secure transaction tracking, and integrated third-party payment gateways.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Runtime** | Node.js, Express.js |
| **Database & ODM** | MongoDB, Mongoose |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt |
| **Data Validation** | Joi (Schema-based request validation) |
| **Payment Gateway** | Stripe API SDK & Webhooks Integration |
| **File Management** | Multer Middleware |
| **API Docs & Tools** | Swagger UI, OpenAPI 3.0, Postman |

---

## 🌟 Key Features

*   **🔐 Role-Based Access Control (RBAC):** Secure routes with specialized permissions dynamically tailored for **Buyers**, **Sellers**, and **Admins**.
*   **💼 Internal Wallet Ecosystem:** A fully automated internal wallet service handling secure account deposits, freelance service payments, seller withdrawals, and ledger transaction tracking.
*   **💳 Stripe Global Payments:** Seamless credit card processing via Stripe Checkout Sessions, paired with secure **Stripe Webhooks** to instantly capture and verify real-time funding events.
*   **📂 Advanced File Uploads:** Configured Multer filters for secure, isolated uploading of user avatars and project attachments.
*   **📝 Automated Documentation:** Interactive Swagger interface generated via a custom automation script (`convert.js`) that parses Postman collections straight into valid OpenAPI 3.0 schemas.
*   **🌱 Database Seeding:** Ready-to-use seed script (`seed.js`) to quickly populate MongoDB with mock data for instant testing.

---

## 📂 Project Structure

```text
├── controllers/          # Request handlers & business logic (User, Service, Order, Wallet...)
├── middlewares/          # JWT Auth, Role gates, Multer configurations & Global Error Boundary
├── models/               # Mongoose schemas & definitions (User, Service, Order, Transaction...)
├── routes/               # Routing layer isolated by domain modules
├── services/             # Core internal services (Wallet operations & Stripe processing layer)
├── validators/           # Strict Joi schema validation objects
├── utils/                # Shared helpers, Custom AppError wrappers & Constants
├── view/                 # Static frontend layout (Landing page placeholder)
├── uploads/              # Local disk storage for uploaded media assets
├── swagger.json          # OpenAPI documentation file
├── convert.js            # Automation script to parse Postman collections into Swagger
├── seed.js               # Database seeding script for development environment
├── server.js             # Application bootstrap & server entry point
└── package.json          # Project dependencies & automated scripts
