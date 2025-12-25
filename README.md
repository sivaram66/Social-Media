-----

#  Full-Stack Social Media Application

A modern, real-time social media platform built with the **PERN stack** (PostgreSQL, Express, React/Next.js, Node.js). Features include real-time notifications, image uploads via AWS S3, and instant messaging capabilities via Socket.io.

##  Live Demo

  * **Frontend (Vercel):** https://social-media-psi-pearl.vercel.app/
  * **Backend (Render):** https://social-media-ited.onrender.com

-----

##  Key Features

  * **Authentication:** Secure Login & Registration using JWT (JSON Web Tokens).
  * **Feed & Posts:** Create dynamic posts with text and images (stored on **AWS S3**).
  * **Social Interactions:** Like, Comment, and Share posts instantly.
  * **Real-Time Notifications:** Instant alerts for likes, comments, and follows using **Socket.io**.
  * **User Connections:** Follow/Unfollow users and explore new profiles.
  * **Modern UI:** Fully responsive design built with **Next.js 14**, **Tailwind CSS**, and **Lucide Icons**.
  * **Search:** Find other users efficiently.

-----

## Tech Stack

### **Frontend (Client)**

  * **Framework:** Next.js 14 (App Router)
  * **Language:** TypeScript
  * **Styling:** Tailwind CSS + Shadcn UI
  * **State Management:** React Query (TanStack Query)
  * **Real-time:** Socket.io-client

### **Backend (Server)**

  * **Runtime:** Node.js
  * **Framework:** Express.js
  * **Database:** PostgreSQL (Hosted on **Neon DB**)
  * **Real-time:** Socket.io
  * **Storage:** AWS S3 (via Multer)
  * **Security:** BCrypt & JWT

-----

##  Project Structure

This project is organized as a **Monorepo**:

```bash
Social-Media-App/
├── client/             # Frontend Application (Next.js)
│   ├── src/app/        # App Router Pages
│   ├── src/components/ # Reusable UI Components
│   └── public/         # Static assets
│
├── server/             # Backend API (Node.js/Express)
│   ├── src/controllers # Business Logic
│   ├── src/models/     # Database Queries
│   ├── src/routes/     # API Endpoints
│   └── src/utils/      # Helpers (S3, Socket, DB)
│
└── .gitignore          # Root ignore file
```

-----

##  Getting Started Locally

Follow these steps to run the project on your local machine.

### 1\. Prerequisites

  * Node.js (v18 or higher)
  * PostgreSQL (or a Neon DB URL)
  * AWS S3 Bucket (for image uploads)

### 2\. Clone the Repository

```bash
git clone https://github.com/sivaram66/Social-Media.git
cd Social-Media
```

### 3\. Setup Backend (Server)

1.  Navigate to the server folder:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` folder and add your secrets:
    ```env
    PORT=5000
    DATABASE_URL=postgresql://neondb_owner:.......@ep-cool-....neon.tech/neondb?sslmode=require
    JWT_SECRET=your_super_secret_key_123

    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID=your_aws_access_key
    AWS_SECRET_ACCESS_KEY=your_aws_secret_key
    AWS_REGION=us-east-1
    AWS_BUCKET_NAME=your_bucket_name
    ```
4.  Start the server:
    ```bash
    npm start
    ```
    *Server should run on `http://localhost:5000`*

### 4\. Setup Frontend (Client)

1.  Open a new terminal and navigate to the client folder:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file (optional, for local dev defaults usually auto-handle localhost, but good for production):
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```
4.  Start the frontend:
    ```bash
    npm run dev
    ```
    *App should run on `http://localhost:3000`*

-----


##  Deployment

### Backend (Render)

1.  Connect your GitHub repo to **Render**.
2.  Set Root Directory to `server`.
3.  Add the Environment Variables from your `.env` file.
4.  Deploy\!

### Frontend (Vercel)

1.  Connect your GitHub repo to **Vercel**.
2.  Set Root Directory to `client`.
3.  Add Environment Variable:
      * `NEXT_PUBLIC_API_URL` = `https://your-render-backend-url.onrender.com`
4.  Deploy\!

-----



