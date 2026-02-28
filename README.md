🗳️ Decentralized University Voting System
<div align="center">












Secure • Transparent • Blockchain-Powered University Elections

Built with ❤️ by Omar Durrah & Mohammad Saleem
Supervised by Dr. Ramze Saifan
University of Jordan

</div>
📌 Overview

The Decentralized University Voting System is a secure blockchain-based election platform designed for university student elections.

It combines:

Ethereum Smart Contracts

Node.js & Express Backend

MySQL Database

MetaMask Wallet Integration

Core Objectives

Ensure vote immutability

Prevent double voting

Provide transparency

Enable real-time analytics

The system supports dual-layer voting:

🏛 University-wide blocs

🏫 College-specific blocs

🤔 Why Blockchain?

Traditional electronic voting systems suffer from:

Centralized manipulation risks

Limited transparency

Difficulty verifying vote integrity

Using Ethereum smart contracts ensures:

✅ Immutable vote recording

✅ On-chain double-voting prevention

✅ Transparent verification

✅ Cryptographic security

🚀 Features
🔐 Security

JWT-based authentication

Role-based access control (Admin / User)

bcrypt password hashing

MetaMask transaction signing

On-chain vote validation

🗳 Voting

Dual-layer voting (University + College)

Smart contract validation

keccak256 hashing

Blockchain-backend hybrid synchronization

📊 Analytics

Real-time results

Interactive charts (Chart.js)

College filtering

15-second caching system

👑 Admin Dashboard

Add / Edit university blocs

Add / Edit college blocs

Duplicate detection

Monitor voting progress

🏗 System Architecture

(Insert your architecture image here)

🔗 Smart Contract

File: VotingSystem.sol
Solidity Version: 0.8.13

The contract:

Maps wallet addresses to voting status

Prevents double voting

Stores vote counts on-chain

Uses keccak256 hashing

Synchronizes with backend

🛠 Technology Stack
Frontend

HTML5

CSS3

JavaScript (ES6+)

Chart.js

Ethers.js

Backend

Node.js

Express.js

MySQL

JWT

bcrypt

Blockchain

Solidity

Truffle

Ganache

Web3.js

⚙️ Installation
Prerequisites

Node.js v18+

MySQL v8+

Ganache v7+

MetaMask

Truffle

1️⃣ Clone Repository
git clone https://github.com/OmarDurrah/Decentralized-Voting-System-Based-On-Ethereum-Blockchain
cd decentralized-voting-system
2️⃣ Install Dependencies
npm install
3️⃣ Database Setup
CREATE DATABASE IF NOT EXISTS amitdb;
USE amitdb;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  college VARCHAR(100) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user'
);

CREATE TABLE university_blocs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE college_blocs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  college VARCHAR(100) NOT NULL
);

CREATE TABLE votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  university_bloc_id INT,
  college_bloc_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
4️⃣ Configure Environment Variables

Create .env file:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=amitdb

JWT_SECRET=your_secure_secret_key
PORT=5500
5️⃣ Deploy Smart Contract
cd blockchain
truffle compile
truffle migrate --network development
6️⃣ Run Backend Server
node backendwauto.js

Open in browser:

http://localhost:5500
🦊 MetaMask Setup

Install MetaMask from https://metamask.io

Add Ganache network:

Field	Value
Network Name	Ganache Local
RPC URL	http://127.0.0.1:7545

Chain ID	1337
Currency	ETH

Import a Ganache private key

Connect wallet in the application

👤 Usage
Student Flow

Login

Connect MetaMask

Select blocs

Confirm transaction

View results

Admin Flow

Login as admin

Manage blocs

Monitor voting

View analytics

🔌 API Endpoints
Method	Endpoint	Description
POST	/login	User login
GET	/university-blocs	Get university blocs
GET	/college-blocs/:college	Get college blocs
POST	/submit-vote	Submit vote
GET	/results	Get results
POST	/admin/university-blocs	Add university bloc
POST	/admin/college-blocs	Add college bloc
🧠 Future Improvements

Deploy to Ethereum Testnet (Sepolia)

Add election time window

Dockerize deployment

Gas optimization

CI/CD integration

👨‍💻 Contributors

Omar Durrah

Mohammad Saleem

Academic Supervisor:
Dr. Ramze Saifan

📜 License

MIT License © 2026 Omar Durrah, Mohammad Saleem

<div align="center">

نظام تصويت جامعي لامركزي آمن وشفاف

⭐ If you like the project, give it a star ⭐

</div>
