# 🏥 Electronic Health Record (EHR) System

## 📑 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Key Features](#key-features)
   - [General](#general)
   - [Login Page](#login-page)
   - [Home Page](#home-page)
   - [Member Page](#member-page)
   - [Report Page](#report-page)
   - [Billing Page](#billing-page)
   - [Settings Page](#settings-page)
4. [Challenges & Lessons Learned](#challenges--lessons-learned)
   - [Data Consistency Across Departments](#data-consistency-across-departments)
   - [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
   - [Security & Privacy](#security--privacy)
   - [Frontend Usability & UX](#frontend-usability--ux)
   - [Data Validation & Integrity](#data-validation--integrity)
   - [Automated Reporting & Snapshots](#automated-reporting--snapshots)
   - [Data Consistency During Concurrent Updates](#data-consistency-during-concurrent-updates)
5. [Q&A](#qa)
   - [Architecture & Design](#architecture--design)
   - [Security & Privacy](#security--privacy)
   - [Frontend & UX](#frontend--ux)
   - [Backend & Data Management](#backend--data-management)
   - [Testing & CI/CD](#testing--cicd)
   - [Performance & Scalability](#performance--scalability)
   - [Future](#future)
6. [Project Screenshots](#project-screenshots)

---

<a name="overview"></a>
## 📖 Overview
In many adult day care centers, patient data is still recorded on paper. This results in **inconsistent records across departments** and **slow retrieval** when information needs to be shared.

This system provides a **centralized, secure, and digital Electronic Health Record (EHR) platform** that ensures:
- Patient information is **consistent** across staff computers.
- Data is **easily retrievable** and **protected**.
- Access is **role-based** and secured with **two-factor authentication (2FA)** via email.
- All changes made by users to patient records are **tracked with audit logs**, providing a secure history of edits and deletions.

The platform is designed for **social adult day care office workers**, providing a streamlined and secure way to manage patient information efficiently.

**🎬 Demo Video:**  
[![Senior Connect Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
*Click the image to watch a full demo of the system in action, showcasing a typical user workflow from login to member management.*

---

<a name="tech-stack"></a>
## 🛠️ Tech Stack
- **Backend**: Python, Django, Django REST Framework
- **Frontend**: React with **protected routes** and **mobile-friendly navigation**
- **Database**: PostgreSQL (hosted via Supabase)
- **Authentication & Security**: JWT, encrypted model fields, **role-based access control for MLTCs**, **organization admins manage users**, two-factor authentication (2FA via email), audit logging for user-made changes
- **Testing**: Pytest
- **CI/CD & DevOps**: GitHub Actions
- **Data validation**: Frontend and backend checks for key fields such as SSN and phone number

---

<a name="key-features"></a>
## ✨ Key Features

### **General**
- **Web app with mobile-friendly navigation bar** for accessibility on any device.
- **Protected routes**: pages are only accessible after authentication.
- **Debounced searching** for faster member lookups.

### **Login Page**
- Users log in with **email and password**.
- **Two-factor authentication (2FA)** code is sent via email.
- **Password reset** done through email.
- **Show/hide password toggle** via eye icon for improved usability.

### **Home Page**
- Displays **SADC member count** and **MLTC count** for each.
- Shows **member count changes** (e.g., +5 / -3), **upcoming birthdays**, and **absences**.
- **Automated monthly snapshots** (birthdays, absences, gifts, members, enrollments) via **GitHub Actions**.
- Tracks **user-made changes** with **audit logs**.

### **Member Page**
- **Search and retrieve member profiles** quickly.
- **Create, update, or delete members**.
- **Update member profiles via individual modals**, making edits focused and user-friendly.
- **Upload and crop profile pictures** for members.
- **Upload member files** (authorizations, documents) via **drag-and-drop**.
- **Print attendance sheets** directly from the profile page.
- **Data validation** on key fields such as SSN and phone number.

### **Report Page**
- View **absences, enrollments, audits, and snapshots** in tabular form.
- Supports **pagination up to 20 items per page**.

### **Billing Page**
- Integrates with Availity API to submit and track claims efficiently based on each member’s schedule.

### **Settings Page**
- **User management**: create, update, delete users, reset passwords via email (**only accessible to organization admins**.)
- Assign **role-based access** for MLTCs.
- **Dark mode** with preferences stored locally.
- **Localization** for English and Chinese users.
- **Data management**: download patient data as Excel, upload Excel to restore or add data.
- **Restore deleted members within 30 days**; members are **automatically deleted via a cron job** after 30 days.
- **Privacy policy, Terms of Service, and Help Center** pages.
- **Secure logout** functionality.

---

<a name="challenges--lessons-learned"></a>
## ⚡ Challenges & Lessons Learned

### Data Consistency Across Departments
- **Challenge:** Moving from paper records and separate Excel files caused **inconsistent data across departments**, duplicate entries, and slow information retrieval. Each staff member had their own version of patient data, which often didn’t match.
- **Approach:**
  - Created a **centralized PostgreSQL database** with unique constraints on key fields (e.g., SSN, member ID).
  - Added **indexes** on frequently queried fields to optimize performance.
  - Implemented **transactional integrity** for all member updates to avoid partial or conflicting changes.
- **Lesson Learned / Impact:** Staff can now access **accurate, up-to-date patient records** from any workstation. Errors are minimized, and queries remain fast even with thousands of members.

### Role-Based Access Control (RBAC)
- **Challenge:** Certain actions, like creating or deleting users, should only be done by **organization admins**, while MLTC staff should only see data relevant to them.
- **Approach:**
  - Centralized the access logic in `MemberQuerySet` and `MemberManager` to **avoid accidental bypass**.
  - Frontend routes are protected based on roles to hide unauthorized UI.
  - Database-level relationships (`sadc` and `active_auth.mltc`) ensure proper scoping.
- **Lesson Learned / Impact:** Provides **secure, maintainable, and scalable RBAC**, ensuring staff see only the data they are authorized to access.

### Security & Privacy
- **Challenge:** Protecting sensitive patient information while keeping the system usable. Risks included unauthorized access, password leaks, and untracked changes.
- **Approach:**
  - Implemented **two-factor authentication (2FA)** via email.
  - Enforced **HTTPS** for all client-server communications.
  - Regularly rotated encryption keys and monitored audit logs for anomalies.
- **Lesson Learned / Impact:** Sensitive data is secured, and all user actions are accountable without impacting usability.

### Frontend Usability & UX
- **Challenge:** The system needed to handle many features but still be **easy for non-technical staff** to navigate on desktop and mobile.
- **Approach:**
  - Added **debounced search** to reduce API calls and improve performance.
  - Used **protected routes** to prevent unauthorized access while maintaining smooth navigation.
  - Implemented clear error alerts and success notifications for UX feedback.
- **Lesson Learned / Impact:** Staff complete tasks faster, with fewer mistakes, and the system feels intuitive across devices.

### Data Validation & Integrity
- **Challenge:** Important fields like **SSN, phone numbers, and emails** needed to be correct to avoid errors and stay compliant.
- **Approach:**
  - Frontend: Inline error messages and input masks for key fields.
  - Backend: Validators raise exceptions for invalid or duplicate entries, caught by API responses.
- **Lesson Learned / Impact:** Fewer mistakes, higher data trustworthiness, and reliable records for reporting and billing.

### Automated Reporting & Snapshots
- **Challenge:** Monthly reports (birthdays, absences, gifts, enrollments, members) used to be **manual and time-consuming**, which often led to mistakes.
- **Approach:**
  - Used **GitHub Actions** to trigger monthly jobs generating PDFs automatically.
  - Backend scripts aggregate data, format it, and save to a secure location.
  - Snapshots include automated totals, attendance summaries, and upcoming birthdays.
- **Lesson Learned / Impact:** Staff now receive **accurate, timely reports** without manual effort, freeing time for patient care.

### Data Consistency During Concurrent Updates
- **Challenge:** Multiple staff members might attempt to update the same member record simultaneously, risking **race conditions**.
- **Approach:**
  - All member updates wrapped in **atomic database transactions**.
  - Combined with **optimistic concurrency control** using `updated_at` or `version` fields to detect concurrent modifications.
  - Users are prompted to reconcile changes if the record was updated by another staff member during their transaction.
- **Lesson Learned / Impact:** Ensures **data integrity**, prevents accidental overwrites, and allows multiple staff to work simultaneously without conflicts.

---

<a name="qa"></a>
## ❓ Q&A

### **Architecture & Design**
**Q:** How is the system organized?  
**A:** It uses a **modularly monolithic architecture**. All core logic is in a single Django project, but the app is divided into modules (e.g., members, reports, settings). This keeps the codebase maintainable without the overhead of microservices.

**Q:** Why Django for the backend?  
**A:** Django is **powerful and easy to start with**:
- Built-in authentication, ORM, and admin tools.
- **Django REST Framework** for secure API endpoints.
- Strong ecosystem for **security features** (encrypted fields, JWT, role-based permissions).
- Large community and documentation for fast development.

**Q:** Why React for the frontend?  
**A:** React provides:
- **Responsive, component-based UI** for mobile and desktop.
- **Dynamic rendering** for features like debounced search, drag-and-drop uploads, and modals.  
- Access to libraries like **image cropping**.

**Q:** Why PostgreSQL for the database?  
**A:** PostgreSQL is **robust and beginner-friendly**:
- Production-grade relational database with ACID compliance.
- Handles **complex queries and aggregations** for reporting.
- Built-in **JSON support** for hybrid structured/unstructured data.
- Integrates seamlessly with Django ORM and Supabase.

**Q:** Why not use a microservices architecture?  
**A:** Microservices add complexity and deployment overhead. The **modularly monolithic** approach maintains separation of concerns while keeping development and deployment simpler.

**Q:** Why not a NoSQL database?  
**A:** Patient records are **highly structured**, require **ACID compliance**, and need **complex queries** for reporting. PostgreSQL is best suited for these requirements.

---

### **Security & Privacy**
**Q:** How is role-based access implemented?  
**A:** Via Django’s permissions system. **Organization admins** manage users, while **MLTC roles** only access their assigned data.

**Q:** How does 2FA via email work?  
**A:** After login with email and password, a unique code is sent to the user’s email. The code must be entered to complete authentication.

**Q:** What do audit logs track?  
**A:** Only **user-made changes** — edits, deletions, and creations of records — ensuring accountability without cluttering logs with system actions.

**Q:** How is sensitive data protected?  
**A:** Using **encrypted model fields**, HTTPS, JWT authentication, and role-based access control.

**Q:** How long do user sessions last, and what happens when they’re inactive?  
**A:** Sessions are handled via **JWT tokens**:
- **Access tokens** expire after **15 minutes** of inactivity.
- **Refresh tokens** last **7 days** and can automatically issue new access tokens without requiring the user to log in again.
- If both tokens expire, the user must log in again. This setup balances usability and security.

---

### **Frontend & UX**
**Q:** How is the app mobile-friendly?  
**A:** Navigation and layouts are fully responsive and tested on desktop and mobile devices.

**Q:** How are member updates handled?  
**A:** Each profile section opens in a **modal**, isolating changes to prevent accidental edits.

**Q:** What UX improvements were implemented?  
**A:** Debounced search, drag-and-drop file uploads, profile picture cropping, show/hide password toggle, protected routes, and mobile-friendly navigation.

**Q:** How are errors handled?  
**A:** Errors, such as failed uploads or invalid input, are displayed to the user via **alerts** that clearly explain what went wrong.

---

### **Backend & Data Management**
**Q:** How are snapshots automated?  
**A:** **GitHub Actions** triggers monthly jobs generating PDFs for birthdays, absences, gifts, enrollments, and member totals.

**Q:** How are files handled?  
**A:** Files are uploaded via drag-and-drop, securely stored in **buckets**, and linked to the correct member profile. **Relative links** are used internally, and files are retrieved via **signed URLs** for secure access.

**Q:** How is data validation enforced?  
**A:** Both **frontend (React forms)** and **backend (Django validators)** enforce checks on fields like SSN and phone numbers.

---

### **Testing & CI/CD**
**Q:** How is testing done?  
**A:** Using **pytest** for unit and integration tests. GitHub Actions automatically runs the test suite on every push.

**Q:** How is deployment or automation handled?  
**A:** GitHub Actions also manages **monthly snapshot generation**, ensuring automated reporting without manual intervention.

---

### **Performance & Scalability**
**Q:** How does the system handle many members?  
**A:** Efficient queries, indexed database fields, and pagination (up to 20 items per page) ensure fast retrieval.

**Q:** How easy is it to extend the system?  
**A:** The modularly monolithic design allows new features or modules to be added without affecting unrelated parts of the codebase.

---

### **Future**
**Q:** What improvements or features could be added next?  
**A:** Some potential enhancements for future versions include:
- **Analytics dashboards** to visualize trends in member data, absences, enrollments, and other metrics.
- **Role-specific notifications** for things like upcoming birthdays, expiring authorizations, or important alerts.
- **Accessibility features**, including screen reader support, high-contrast modes, and keyboard navigation.
- **Offline support** so staff can continue working when internet connectivity is limited.
- **Real-time updates** so multiple staff see changes immediately without refreshing.
- **Enhanced security features**, such as IP whitelisting or rate limiting.
- **Improved error handling** with centralized logging and alerts, beyond simple on-screen notifications.
- **Audit log scalability improvements** to efficiently store and query large volumes of user activity, including partitioned tables, indexing, and archiving older logs to cloud storage for performance.
- **Multi-tenant support** to allow the platform to securely host multiple organizations while keeping their data isolated, enabling expansion to multiple adult day care centers without deploying separate instances.

---

<a name="project-screenshots"></a>
## 📸 Project Screenshots
