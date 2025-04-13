📣 WhisperDesk – Smart Complaint Management System

WhisperDesk is a role-based complaint management system built using **Spring Boot**, **JWT Authentication**, **MySQL**, and a custom **HTML/CSS/JavaScript** frontend. It's designed to streamline how employees file complaints and how managers/admins handle them, with support for anonymous submissions and status updates.
--------------------------------------------------------
## 🚀 Features
👩‍💼 Employee Functionality:
- Register and log in securely
- File complaints under specific departments
- Choose to submit complaints **anonymously**
- Track all complaints with real-time status updates:
  - **Pending**
  - **In Progress**
  - **Completed**
  - **Rejected**

 👨‍💼 Manager Functionality:
- View complaints filed in their department
- Cannot see identity on anonymous complaints
- Update complaint statuses
- Add feedback/remarks on complaints (visible to employee and admin)

🛡️ Admin Functionality:
- View **all** complaints across departments
- See both visible and anonymous complaints
- View employee details (even for hidden complaints)
- Manage system users and monitor complaint resolution

--------------------------------------------------------


🔐 Security Features

- Role-based login and dashboard redirection
- JWT token-based authentication and session management
- Frontend access control based on roles
- Secure password storage using encryption
--------------------------------------------------------


⚙️ Tech Stack

- **Backend:** Spring Boot, Spring Security, Hibernate (JPA)
- **Frontend:** HTML, CSS, JavaScript
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)

--------------------------------------------------------

📂 Project Structure

WhisperDesk/ ├── src/ │ └── main/ │ ├── java/com/whisperDesk/ │ │ ├── auth/ # JWT & login logic │ │ ├── controller/ # REST API controllers │ │ ├── entity/ # JPA entities (User, Complaint, etc.) │ │ ├── repository/ # Spring Data JPA repositories │ │ ├── service/ # Business logic │ │ └── security/ # Role config, filters, auth providers │ └── resources/ │ ├── application.properties │ └── static/ # HTML, CSS, JS ├── pom.xml └── README.md

--------------------------------------------------------

🛠️ How to Run

1. **Clone the repo:**
   ```bash
   git clone https://github.com/4ryanwalia/WhisperDesk.git
   cd WhisperDesk
Set up MySQL database:

Create a database named whisperdesk

Update application.properties with your DB username and password

Run the app:
bash
Copy
Edit
mvn clean install
mvn spring-boot:run

Open the frontend HTML files manually in your browser.

📌 Current Status
✅ Complaint submission working with role mapping

✅ Status and feedback update flow in place
✅ Hidden complaints anonymized for managers
🧪 Testing phase for UI integration with backend
🚧 Future: Add email notifications and analytics dashboard


## 🔐 Application Walkthrough

### 🔸 Login Page
📍 URL: `http://localhost:9097/login.html`

<img src="https://github.com/user-attachments/assets/210f6549-84d1-4992-95a4-16ef64ad7821" alt="Login Page" width="600"/>

---

### 🔸 Registration Page

<img src="https://github.com/user-attachments/assets/64f54274-5e75-4955-9b81-cb842b85ad48" alt="Register Page" width="600"/>

---

### 👨‍💼 Employee Dashboard

- View submitted complaints
- Track statuses
- File new complaints

<img src="https://github.com/user-attachments/assets/264bdf7c-dd5e-49ff-a3cd-c76eaafc4b32" alt="Employee Dashboard" width="600"/>

---

### 🔒 Anonymous Complaint Visibility

- Employees **cannot** view hidden complaints filed by others.

<img src="https://github.com/user-attachments/assets/3cb4d129-3210-443d-bb76-066d965d91ab" alt="Hidden Complaint View" width="600"/>

---

### 🧑‍💼 Manager Dashboard

- View and manage complaints in assigned departments
- Change complaint status
- Add feedback
- Hidden complaints do **not** reveal employee identity

<img src="https://github.com/user-attachments/assets/6281f11f-5de1-4dc4-9740-b0971f468f39" alt="Manager Dashboard" width="600"/>

---

### 🛡️ Admin Dashboard

- Full complaint visibility
- Can create new managers
- Manage both employees and managers

<img src="https://github.com/user-attachments/assets/a998c624-7cf4-40f2-a002-9a8e7d2abfef" alt="Admin Dashboard" width="600"/>

---

### 👥 Manage Employees

- View and manage all registered employees

<img src="https://github.com/user-attachments/assets/5eb3206b-a2e5-4c4b-97fc-c20df4774ee5" alt="Admin - Manage Employees" width="600"/>

---

### 👔 Manage Managers

- View and manage all registered managers

<img src="https://github.com/user-attachments/assets/2c342648-3988-4335-8a5e-4ae04f8f5d36" alt="Admin - Manage Managers" width="600"/>



