Perfect! Here's the updated README with your MySQL schema:

Decentralized University Voting System 🗳️

{
"technologies": {
"solidity": "0.8.13",
"ethereum": "Ganache",
"node": "18.x",
"mysql": "8.0"
}
}
A secure, transparent, and decentralized voting system for university elections with dual-layer voting (university-wide and college-specific blocs). Built on Ethereum blockchain with a modern web interface.

✨ Features
javascript
// Core Features
const features = {
security: [
"JWT-based authentication with role-based access control",
"bcrypt password hashing for secure credential storage",
"MetaMask integration for blockchain transaction signing",
"Email-based double-voting prevention via blockchain"
],
voting: [
"Dual-layer voting - University blocs + College-specific blocs",
"Blockchain-verified votes - Immutable and transparent",
"Real-time vote counting with MySQL-blockchain sync",
"Vote hashing using keccak256 for privacy preservation",
"Arabic language support for bloc names"
],
analytics: [
"Interactive charts using Chart.js with winner highlighting",
"College-filtered results for granular analysis",
"15-second caching for optimal performance",
"Live refresh capability for real-time updates"
],
admin: [
"Bloc management - Add/Edit university and college blocs",
"Duplicate prevention - Automatic checks for existing blocs",
"Blockchain synchronization - Auto-sync new blocs to smart contract",
"Role-based access (Admin/User)"
]
}
🏗️ Architecture

┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Express API    │────▶│   MySQL DB     │
│   (HTML/CSS/JS) │     │   (Node.js)      │     │   (amitdb)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                        │                         │
         │                        │                         │
         ▼                        ▼                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   MetaMask      │────▶│   Smart Contract │────▶│   Ganache      │
│   (Wallet)      │     │   (Solidity)     │     │   (Blockchain)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘



🚀 Technology Stack
Frontend
javascript
const frontend = {
languages: ["HTML5", "CSS3", "JavaScript (ES6+)"],
libraries: ["Chart.js", "Ethers.js"],
features: ["Dark/Light theme toggle", "Responsive UI", "Arabic script support"]
}
Backend
javascript
const backend = {
runtime: "Node.js + Express",
database: "MySQL (amitdb)",
authentication: ["JWT", "bcrypt"],
apis: "RESTful"
}
Blockchain
javascript
const blockchain = {
language: "Solidity 0.8.13",
framework: "Truffle Suite",
development: "Ganache",
interaction: "Web3.js"
}
📦 Installation
Prerequisites


# Required Software (click to download)

- Node.js v18+ → https://nodejs.org/
- MySQL v8.0+ → https://dev.mysql.com/downloads/
- Ganache v7.0+ → https://trufflesuite.com/ganache/
- MetaMask → https://metamask.io/ (browser extension)
  Step 1: Clone the Repository
  bash
  git clone https://github.com/yourusername/decentralized-voting-system.git
  cd decentralized-voting-system
  Step 2: Install Dependencies
  bash
  npm install express body-parser mysql2 cors bcryptjs jsonwebtoken ethers web3 dotenv
  Step 3: Database Setup (MySQL)
  Run this SQL code in your MySQL client (phpMyAdmin, MySQL Workbench, or terminal):

sql
-- Use your database
USE amitdb;

-- Clean up old dependencies
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS college_blocs;
DROP TABLE IF EXISTS university_blocs;
DROP TABLE IF EXISTS users;

-- 👤 Users Table with college info
CREATE TABLE IF NOT EXISTS users (
id INT AUTO_INCREMENT PRIMARY KEY,
email VARCHAR(100) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL,
college VARCHAR(100) NOT NULL
);

-- 🏛 University Blocs
CREATE TABLE IF NOT EXISTS university_blocs (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL
);

-- 🏫 College Blocs (with college relationship)
CREATE TABLE IF NOT EXISTS college_blocs (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
college VARCHAR(100) NOT NULL
);

-- 🗳 Votes Table: captures both university & college bloc votes
CREATE TABLE IF NOT EXISTS votes (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
university_bloc_id INT,
college_bloc_id INT,
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (university_bloc_id) REFERENCES university_blocs(id),
FOREIGN KEY (college_bloc_id) REFERENCES college_blocs(id)
);

-- Add role column to users
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user';

-- ➕ Insert Admin User
INSERT INTO users (email, password, college, role)
VALUES ('admin@voting.com', 'admin123', 'admin', 'admin');

-- ➕ Add example users
INSERT INTO users (email, password, college) VALUES
('john.doe@example.com', 'password123', 'engineering'),
('omar.doe@example.com', 'password1234', 'medicine'),
('ramzy.doe@example.com', 'password12345', 'engineering');

-- ➕ Insert University Bloc options (Arabic names)
INSERT INTO university_blocs (name) VALUES
('كتلة اهل الهمة'),
('كتلة النشامى'),
('كتلة العسافية');

-- ➕ Insert Engineering College Blocs
INSERT INTO college_blocs (name, college) VALUES
('كتلة احسان', 'engineering'),
('كتلة اثر', 'engineering'),
('كتلة انصار', 'engineering');

-- ➕ Insert Medicine College Blocs
INSERT INTO college_blocs (name, college) VALUES
('كتلة طب', 'medicine'),
('كتلة ارجاع', 'medicine'),
('كتلة مقاومة', 'medicine');

-- ✅ View All Data
SELECT _ FROM users;
SELECT _ FROM university_blocs;
SELECT \* FROM college_blocs;
Step 4: Create .env File
Create a file named .env in your project root:



# Copy these lines into your .env file

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=amitdb
JWT_SECRET=your_super_secret_jwt_key_here_change_this
PORT=5500
Step 5: Blockchain Setup


# Terminal 1 - Deploy Smart Contract

cd blockchain
truffle compile
truffle migrate --network development
Step 6: Start the Application


# Terminal 2 - Start Backend Server

node backendwauto.js

# Expected output:

# ✅ Connected to MySQL Database

# 📌 Contract Address: 0x...

# 🚀 Server running on http://172.28.128.1:5500

Step 7: Access the Application
text
http://localhost:5500
🎯 Usage Guide
User Flow
javascript
async function userFlow() {
// 1. Login with credentials
// 2. Connect MetaMask when prompted
// 3. Select university bloc (e.g., "كتلة اهل الهمة")
// 4. Select college bloc based on your college
// 5. Confirm transaction in MetaMask
// 6. View real-time results
}
Admin Flow
javascript
async function adminFlow() {
// 1. Login with admin@voting.com
// 2. Manage blocs (add/edit university/college blocs)
// 3. Monitor vote progress across all colleges
// 4. View analytics for engineering/medicine colleges
}
🔧 API Endpoints
Method Endpoint Description
POST /login User login
GET /university-blocs Fetch all university blocs
GET /college-blocs/:college Fetch college blocs by college
POST /submit-vote Submit votes (backup)
GET /results Get vote results
GET /all-colleges Get distinct college names
POST /admin/university-blocs Add university bloc
PUT /admin/university-blocs/:id Edit university bloc
GET /admin/college-blocs List college blocs
POST /admin/college-blocs Add college bloc
📁 Project Structure

decentralized-voting-system/
│
├── 📄 backendwauto.js # Main Express server
├── 📄 package.json # Node dependencies
├── 📄 .env # Environment variables (create this)
│
├── 📁 blockchain/ # Truffle project folder
│ ├── 📁 contracts/
│ │ └── 📄 VotingSystem.sol # Smart contract
│ ├── 📁 migrations/
│ │ └── 📄 2_deploy_contracts.js
│ └── 📁 build/
│ └── 📁 contracts/
│ └── 📄 VotingSystem.json # Compiled contract (ABI)
│
├── 📁 public/ # Frontend files
│ ├── 📄 index.html # Login page
│ ├── 📄 admin.html # Admin dashboard
│ ├── 📄 style.css # Global styles
│ ├── 📄 script.js # Frontend logic
│ └── 📁 abi/ # Contract ABI folder
│ └── 📄 VotingSystem.json # Copy from blockchain/build
│
└── 📄 README.md # This file
📊 Database Schema
Users Table
Column Type Description
id INT Primary Key
email VARCHAR(100) Unique user email
password VARCHAR(255) Hashed password
college VARCHAR(100) User's college
role ENUM 'user' or 'admin'
University Blocs Table
Column Type Description
id INT Primary Key
name VARCHAR(100) Bloc name (Arabic)
College Blocs Table
Column Type Description
id INT Primary Key
name VARCHAR(100) Bloc name (Arabic)
college VARCHAR(100) Associated college
Sample Data
javascript
const sampleData = {
colleges: ["engineering", "medicine"],
universityBlocs: ["كتلة اهل الهمة", "كتلة النشامى", "كتلة العسافية"],
engineeringBlocs: ["كتلة احسان", "كتلة اثر", "كتلة انصار"],
medicineBlocs: ["كتلة طب", "كتلة ارجاع", "كتلة مقاومة"]
}
🧪 Test Credentials
javascript
const testAccounts = {
admin: {
email: "admin@voting.com",
password: "admin123",
role: "admin"
},
engineeringStudent: {
email: "john.doe@example.com",
password: "password123",
college: "engineering"
},
medicineStudent: {
email: "omar.doe@example.com",
password: "password1234",
college: "medicine"
},
anotherEngineeringStudent: {
email: "ramzy.doe@example.com",
password: "password12345",
college: "engineering"
}
}
🚦 Troubleshooting
VS Code Color Issue
bash

# If code appears white in VS Code:

1. Press Ctrl+Shift+P
2. Type "Change Language Mode"
3. Select "JavaScript" or "SQL" for database files
4. Or install "Prettier" extension and format with Shift+Alt+F
   Common Issues
   javascript
   // Cannot find module error
   npm install

// MySQL connection error
// Check: MySQL running? .env credentials correct? Database 'amitdb' exists?

// MetaMask connection error
// Check: Ganache running? Network set to http://127.0.0.1:7545? Account imported?

// Arabic text display issues
// Ensure your database charset is utf8mb4
ALTER DATABASE amitdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
🤝 Contributing
bash

# 1. Fork the repository

# 2. Create your feature branch

git checkout -b feature/AmazingFeature

# 3. Commit your changes

git commit -m 'Add some AmazingFeature'

# 4. Push to the branch

git push origin feature/AmazingFeature

# 5. Open a Pull Request

📄 License
text
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
📧 Contact
javascript
const contact = {
github: "https://github.com/yourusername/decentralized-voting-system",
email: "your.email@example.com",
project: "Decentralized University Voting System",
database: "amitdb"
}

⭐ Support the project with a star!

نظام تصويت جامعي لامركزي آمن وشفاف

Built with ❤️ for transparent and secure elections
