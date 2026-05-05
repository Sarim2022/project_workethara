# 🚀 Workethara: Team Task Manager

A professional, full-stack web application designed for high-performance team collaboration. Built with **Next.js 15 (App Router)**, **Prisma**, and **Supabase**, Workethara provides a seamless environment for managing projects, assigning tasks, and tracking progress with strict Role-Based Access Control (RBAC).

---

## 📌 Project Overview

This application was built as a comprehensive solution for the **Team Task Manager (Full-Stack)** assignment. It enables organizations to maintain a clear hierarchy where Admins manage the workspace and Members focus on task execution.

### 🚀 Key Features

-   **🔒 Secure Authentication**: custom signup/login flow with JWT-based sessions stored in secure, `httpOnly` cookies.
-   **🛡️ Role-Based Domain Validation**:
    *   **Admins**: Must use `@workspace.in` emails. Automatically granted full workspace control.
    *   **Members**: Must use `@email.in` emails. Restricted to personal task views and status updates.
-   **📁 Project Management**: Admins can create projects with unique IDs, descriptions, and client details.
-   **✅ Task Lifecycle**: Full tracking from `PENDING` → `IN_PROGRESS` → `TESTING` → `DONE`.
-   **📊 Modern Dashboard**:
    *   **Stats Grid**: Real-time project counts, task completion rates, and backlog tracking.
    *   **Jira-style Action Portal**: Quick-access cards for Admins (Sprints, Issues, Repos, Meetings).
    *   **Activity Feed**: Live log of status changes made by team members.
-   **✨ Premium UI/UX**: Professional "SaaS" aesthetic using **Tailwind CSS** and **Shadcn UI**, featuring glassmorphism, color-coded status accents, and responsive design.

---

## 🛠️ Tech Stack

-   **Framework**: Next.js 15 (React 19)
-   **Database**: Supabase (PostgreSQL)
-   **ORM**: Prisma
-   **Styling**: Tailwind CSS + Shadcn UI
-   **Icons**: Lucide React
-   **Validation**: Zod
-   **Auth**: Custom JWT (Jose) + Bcryptjs

---

## 🚦 Getting Started

### 1. Prerequisites
-   Node.js 18+ installed
-   A Supabase project (PostgreSQL)
-   JWT Secret key

### 2. Installation
```bash
git clone https://github.com/YourUsername/workethara.git
cd workethara
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_secure_random_secret"
```

### 4. Database Setup
```bash
npx prisma db push
```

### 5. Run Locally
```bash
npm run dev
```

---

## 📖 Usage Guide

### Admin Workflow (`@workspace.in`)
1.  **Register** as an Admin using your official workspace email.
2.  **Create a Project** from the "Jira-style" action cards.
3.  **Add Members** to your projects by searching their registered email.
4.  **Assign Tasks** to specific members within those projects.
5.  **Monitor Progress** via the Activity Feed and Task Overview table.

### Member Workflow (`@email.in`)
1.  **Register** as a Member using your email.
2.  **View Assigned Tasks** on your personalized dashboard.
3.  **Update Status**: Use the "Next Phase" button to cycle through Pending, In Progress, Testing, and Done.
4.  **Track Projects**: See the "My Projects" sidebar to see which workspaces you are currently part of.

---

## ⚖️ License
This project was developed as a full-stack assignment. All rights reserved.
