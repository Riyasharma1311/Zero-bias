# ❤️ Heart Sync

**Heart Sync** is a comprehensive and scalable healthcare platform designed for cardiologists and medical professionals. It enables effective patient data management, real-time health monitoring, and AI-powered heart risk assessments — all through a secure and performance-driven system.

This repository includes both the **FastAPI backend** and a **Next.js frontend** built with **TypeScript**.

---

## 📦 Features Overview

### 🔧 Backend (FastAPI)

- ⚡ Asynchronous API operations for high performance
- 🔐 JWT-based authentication
- 🛡️ Role-based access control (Doctor/Admin)
- 🩺 Medical data and document management
- 🧠 AI-powered heart risk prediction API
- 🔒 Secure file handling (HIPAA-compliant)
- 🧪 Comprehensive test suite
- 🗃️ SQLite + Prisma ORM
- 🧾 Audit logging for all critical actions

### 🌐 Frontend (Next.js + TypeScript)

- 💻 Doctor-focused dashboard interface
- 📊 Vital signs visualization and trend analysis
- 🏥 Risk stratification and treatment tracking
- 📋 Report generation and critical alerts
- 🔗 Seamless API integration with FastAPI backend

---

## 🚀 Getting Started

### 🛠️ Backend Setup (FastAPI)

> ✅ **Preferred OS**: Ubuntu/Linux  
> ❗ Ensure Python 3.9+ is installed

1. **Clone the repository and navigate to the backend folder**:
    ```bash
    git clone https://github.com/your-username/heart-sync.git
    cd heart-sync/backend
    ```

2. **Create and activate a virtual environment**:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3. **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4. **Configure environment variables**:
    ```bash
    cp .env.example .env
    # Edit the .env file with your configuration
    ```

5. **Run the FastAPI application**:
    ```bash
    fastapi run
    ```

6. **Access the API**:
    - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
    - OpenAPI Schema: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

### 🌐 Frontend Setup (Next.js + TypeScript)

1. **Navigate to the frontend directory**:
    ```bash
    cd ../frontend
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Run the development server**:
    ```bash
    npm run dev
    ```

4. **The frontend will be available at**:  
    [http://localhost:3000](http://localhost:3000)

---

## 🔒 Authentication & Security

- Secure login for verified medical professionals
- Role-based access: Doctor/Admin privileges
- Encrypted medical data (HIPAA-compliant)
- JWT tokens for secure API communication
- Full audit logs for traceability

---

## 👨‍⚕️ Doctor-Focused Features

- 📁 Patient management dashboard
- ⚠️ High-risk patient identification
- 📉 Health trend and treatment tracking
- 📤 Document uploads and automated reporting
- 🔔 Critical condition alerting system

---

## 🧪 Development Notes

- Uses type hints throughout for better readability and maintainability
- Recommended to use Linux for backend development
- Prisma setup: run migrations before use (if applicable)
- Expandable for multi-hospital or multi-doctor support

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change or improve.

---

