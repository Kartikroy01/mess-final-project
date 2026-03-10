# NITJ Mess Management System

![NITJ Mess Portal Banner](https://via.placeholder.com/1200x300/1464aa/FFFFFF?text=NITJ+Mess+Management+System)

A comprehensive, full-stack web application designed to streamline and digitalize mess (cafeteria) operations for the National Institute of Technology, Jalandhar (NITJ). This platform bridges the gap between students and the mess administration (Munshis), providing real-time tracking, seamless meal logging, and accurate billing.

## 🚀 Features

### For Students
*   **Live Dashboard**: Real-time overview of current month's meal counts, balance, and next upcoming meal.
*   **QR Code Integration**: Dynamic QR code generated for every student. Just show it at the counter!
*   **Profile Personalization**: Upload and crop profile photos for visual verification.
*   **Meal & Bill History**: View detailed logs of taken meals, extra items purchased, and download PDF statements.
*   **Mess Off Applications**: Apply for "Mess Off" (leave) for specific dates/meals and track approval status.
*   **Feedback System**: Rate meals and provide constructive feedback to improve mess quality.

### For Admin/Munshi
*   **Rapid QR Scanner**: Instantly scan student QR codes (or search by Roll Number) to log meals.
*   **Visual Verification**: Displays the student's custom profile photo upon scanning to prevent card sharing.
*   **Extra Items Management**: Add, update, and sell extra food items directly to a student's account.
*   **Mess Off Moderation**: Review, approve, or reject student leave applications.
*   **Automated Billing**: Automatically generate start-of-month and end-of-month Excel sheets for accounting.
*   **Live Session Stats**: Monitor how many students have taken a diet in the current session versus how many are absent.

## 🛠️ Tech Stack & Skills

### 🌐 Frontend Development
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

### ⚙️ Backend Architecture
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

### 🔧 Tools & Libraries
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Nodemailer](https://img.shields.io/badge/Nodemailer-1464aa?style=for-the-badge&logo=nodemailer&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

## ⚙️ Local Development Setup

### Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB (Local installation or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/Kartikroy01/mess-final-project.git
cd mess-final-project
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mess_management
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_specific_password
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `/frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

## 🔒 Security Measures
*   Passwords are securely hashed using `bcryptjs` before storage.
*   Protected API routes verified via HTTP Bearer tokens.
*   File upload validation (MIME-type and size limitations) to prevent malicious uploads.
*   QR codes omit highly sensitive static data and act primarily as identifiers.

## 📝 License
This project is proprietary and developed specifically for internal use. All rights reserved.
