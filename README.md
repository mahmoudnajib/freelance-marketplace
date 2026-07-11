# Freelance Marketplace API # 21

A robust, secure, and fully-featured RESTful API for a Freelance Marketplace platform built with the Node.js ecosystem. The project follows the **MVC architecture** and implements professional industry best practices including strict validation, global error handling, and secure role-based authentication.

## 🚀 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT)
- **Validation:** Joi (Schema-based request validation)
- **File Uploads:** Multer
- **Security & Utilities:** Cors, Dotenv, Bcrypt

---

## 📂 Project Structure

```text
├── controllers/      # Request handlers & business logic
├── middlewares/      # Authentication, role gates, file uploads & error boundary
├── models/           # Mongoose schemas & data definitions
├── routes/           # Routing layer split by domain modules
├── utils/            # Shared helper functions & constants
├── validators/       # Joi schema validation objects
├── view/             # Static frontend files (Landing Page)
├── .env              # Local environment config (Ignored in Git)
├── .gitignore        # Git exclusion rules
├── server.js         # Application entry point
└── package.json      # Project dependencies & scripts