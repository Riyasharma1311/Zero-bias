# ❤️ Heart Sync

Heart Sync is a **comprehensive and scalable healthcare platform** designed for cardiologists and medical professionals. It enables **effective patient data management**, **real-time health monitoring**, and **AI-powered heart risk assessments** — all through a secure and performance-driven system.

This repository includes both the **FastAPI backend** and a **Next.js frontend** built with **TypeScript**.

---

## 📦 Features Overview

### 🔧 Backend (FastAPI)
- ⚡ Asynchronous API operations for high performance  
- 🔐 JWT-based authentication  
- 🛡️ Role-based access control (Doctor/Admin)  
- 🩺 Medical data and document management  
- 🧠 AI-powered heart risk prediction API  
- 🔒 Secure file handling 
- 🧪 Comprehensive test suite  
- 🗃️ SQLite 
- 🧾 Audit logging for all critical actions  

### 🌐 Frontend (Next.js + TypeScript)
- 💻 Doctor-focused dashboard interface  
- 📊 Vital signs visualization and trend analysis  
- 🏥 Risk stratification and treatment tracking  
- 📋 Report generation and critical alerts  
- 🔗 Seamless API integration with FastAPI backend  

---

## 🤖 Machine Learning Overview

Heart Sync uses a **dual-model ML pipeline** to power intelligent predictions related to **heart failure readmission risk** and **expected readmission duration**.

### ✅ Model Architectures Used
- **Logistic Regression**  
- **Support Vector Machine (SVM)**  
- **XGBoost Classifier**  
- **LightGBM Classifier**  
- **Balanced Random Forest Classifier**  

These models were trained and evaluated to solve **class imbalance** and predict heart failure patient **readmission within 30 days** after discharge.

---

## 📊 Performance Summary

### 🔍 Baseline Model Highlights:
- **High precision for majority class (Non-Readmission)**: ~94%  
- **Decent recall for minority class (Readmission)**: ~46%  
- **Feature importance visibility**: Key features were numerical and interpretable  

### ⚠️ Identified Challenges:
- **Low precision for minority class (Readmission)**: ~13%  
- **Overall accuracy ~72%** — misleading due to class imbalance  
- **Low F1-score for minority class (~0.21)** → Indicates difficulty in identifying true readmissions

### 📈 Model Evaluation Metrics:
| Metric                   | Value  |
|--------------------------|--------|
| AUC-PR                   | ~0.12  |
| F1 Threshold             | 0.234  |
| Minority Class Recall    | 46%    |
| Minority Class Precision | 13%    |
| Support (class 1)        | 194    |

---

## 🔮 Model Output

- 🧪 **Readmission Risk (Yes/No)**  
- 📅 **Predicted Days to Readmission**  
- 📋 **Comprehensive patient summary**  
- 📈 **Risk visualization and alerts for doctors**  

---

## 🚀 Getting Started

### 🛠️ Backend Setup (FastAPI)

✅ Preferred OS: Ubuntu/Linux  
❗ Ensure Python 3.9+ is installed

```bash
git clone https://github.com/Riyasharma1311/Zero-bias
cd Zero-bias/backend
```

Create and activate a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables:

```bash
cp .env.example .env
# Edit the .env file with your configuration
```

Run the FastAPI application:

```bash
fastapi run
```

Access the API:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)  
- **OpenAPI Schema**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

### 🌐 Frontend Setup (Next.js + TypeScript)

Navigate to the frontend directory:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend will be available at:  
👉 [http://localhost:3000](http://localhost:3000)

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
- Prisma setup: run migrations before use  
- Expandable for multi-hospital or multi-doctor support  

---

## 🔮 Future Enhancements

- 📈 Real-time Hospital Dashboard for patient-level and ward-level readmission monitoring  
- 🤖 Deep Learning model integration (LSTM/Transformers for sequential records)  
- 📱 Native iOS/Android mobile apps for remote monitoring  
- 🔗 EHR System Integration for hospitals  
- 📊 AI-Driven Analytics for administrative reports  
- 🛡️ Full HIPAA/GDPR Compliance for production readiness  

---

## 📑 Reports & Documentation

All reports, presentations, and documentation related to this project can be accessed via the following Drive link:

📎 [Google Drive Folder - Reports](https://drive.google.com/file/d/1UPLe8Oo10HTvhCLWUahSimUP1CFWN3Zl/view?usp=drive_link)

---


## 🤝 Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you would like to change or improve.

---

*Built with ❤️ by Team Zero Bias — for better healthcare outcomes*
