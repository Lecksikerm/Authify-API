Authify API

Authify is a user authentication system built with Node.js, PostgreSQL, Redis, and JWT. It supports:

User registration with email OTP verification

Login with access and refresh tokens

Token refresh and logout

Secure password storage with bcrypt

Table of Contents

Features

Tech Stack

Prerequisites

Setup & Installation

Environment Variables

API Endpoints

Testing OTP Emails

License

Features

Signup with email verification via OTP (expires in 10 minutes)

Login only after verification

JWT-based authentication (access + refresh tokens)

Refresh token mechanism for session persistence

Logout invalidates refresh tokens in Redis

Redis used for OTP and refresh token storage

Tech Stack

Node.js (Backend)

Express.js (HTTP Server)

PostgreSQL (User database)

Redis (OTP and token storage)

bcrypt (Password hashing)

JWT (JSON Web Tokens for auth)

Nodemailer (Email OTP sending)

Prerequisites

Node.js >= 18

PostgreSQL >= 16

Redis >= 7

npm or yarn

Gmail account for sending OTPs

# Deployment URl
https://authify-api-project.onrender.com
