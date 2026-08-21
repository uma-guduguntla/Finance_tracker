# Finance_tracker
#  Smart Spending Analyzer

A full-stack financial management system that helps users **track expenses, detect hidden money leaks, and analyze spending behavior** using a rule-based intelligent engine.

---

## 📌 Overview

Smart Spending Analyzer is designed to go beyond traditional expense trackers. Instead of just recording transactions, the system analyzes user spending patterns and provides **actionable insights** to improve financial habits.

---

## 🚀 Features

### 🔐 Authentication

* User Registration & Login
* Secure authentication (JWT-based)
* Password encryption

### 💰 Expense Management

* Add, edit, delete expenses
* Categorization (Food, Transport, Shopping, Bills, Others)
* View complete transaction history

### 🧠 Smart Analysis Engine

* Detect frequent small-value transactions
* Identify recurring expenses (subscriptions)
* Detect category-wise overspending
* Highlight “money leaks”

### 📊 Dashboard & Analytics

* Total spending overview
* Category-wise breakdown (Pie chart)
* Monthly trends (Graph)
* Leak alerts & insights

### 💡 Explanation Engine

* Generates human-readable insights
* Example:

  * "You are spending frequently on food delivery"
  * "Your shopping expenses increased significantly this month"

---

## 🏗️ System Architecture

```
Frontend (React)
        ↓
REST API (Spring Boot Controllers)
        ↓
Service Layer (Analysis & Business Logic)
        ↓
Repository Layer (JPA)
        ↓
MySQL Database
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Chart.js / Recharts

### Backend

* Java
* Spring Boot
* Spring Data JPA (Hibernate)

### Database

* MySQL

### Tools

* IntelliJ IDEA
* Maven
* Git & GitHub

---

## 📂 Project Structure

```
smartspending
 ├── controller
 ├── service
 ├── repository
 ├── entity
 ├── dto
 ├── config
 └── SmartspendingApplication.java
```

---

## 🗄️ Database Schema

### Users

* id
* name
* email
* password

### Expenses

* id
* user_id
* amount
* category
* description
* date

### Leak_Explanations

* id
* user_id
* type
* explanation
* detected_at

---

## 🔌 API Endpoints

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

### Expenses

* `POST /api/expenses`
* `GET /api/expenses`
* `PUT /api/expenses/{id}`
* `DELETE /api/expenses/{id}`

### Analysis

* `GET /api/analysis/leaks`
* `GET /api/analysis/dashboard`

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```
git clone https://github.com/your-username/smart-spending-analyzer.git
cd smart-spending-analyzer
```

### 2. Configure Database

Create MySQL database:

```
CREATE DATABASE smart_spending;
```

Update `application.properties`:

```
spring.datasource.url=jdbc:mysql://localhost:3306/smart_spending
spring.datasource.username=root
spring.datasource.password=your_password
```

### 3. Run Backend

```
mvn spring-boot:run
```

Backend will start at:

```
http://localhost:8080
```

### 4. Run Frontend

```
npm install
npm start
```

---

## 📈 Future Enhancements

* AI-based spending prediction
* Budget recommendation system
* Mobile app (Android/iOS)
* Bank API integration
* Personalized financial planning

---

## ⚠️ Limitations

* Rule-based system (not adaptive like ML models)
* Depends on user input accuracy
* Limited predictive capabilities

---

## 🎯 Key Highlight

> This system does not just track expenses — it analyzes behavior and detects hidden financial leaks.

---

## 👨‍💻 Contributors

* Your Name
* Team Members

---

## 📄 License

This project is developed for academic purposes.
