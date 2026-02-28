# 🗳️ Decentralized University Voting System



Secure • Transparent • Blockchain-Powered University Elections

Built with ❤️ by **Omar Durrah** & **Mohammad Saleem**
Supervised by **Dr. Ramze Saifan**
**University of Jordan**



---

## 📌 Overview

The **Decentralized University Voting System** is a secure and transparent election platform designed for university student elections.

It combines **Ethereum smart contracts** with a **Node.js backend** and **MySQL database** to provide:

* Immutable vote storage
* Double-voting prevention
* Role-based administration
* Real-time analytics and visualization

The system supports **dual-layer voting**:

* 🏛 University-wide blocs
* 🏫 College-specific blocs

---

## 🤔 Why Blockchain?

Traditional electronic voting systems suffer from:

* Centralized manipulation risks
* Lack of transparency
* Difficulty verifying vote integrity

By using **Ethereum smart contracts**, this system ensures:

* ✅ Immutable vote recording
* ✅ Transparent verification
* ✅ Cryptographic security
* ✅ On-chain double-voting prevention

---

## 🚀 Features

### 🔐 Security & Authentication

* JWT-based authentication
* Role-based access control (Admin/User)
* bcrypt password hashing
* MetaMask transaction signing
* Blockchain-based double-voting prevention

### 🗳 Voting Mechanism

* Dual-layer voting (University + College blocs)
* Smart contract validation
* keccak256 vote hashing
* Real-time synchronization
* Arabic language support

### 📊 Results & Analytics

* Interactive charts (Chart.js)
* College-filtered analytics
* 15-second caching
* Live refresh capability

### 👑 Admin Dashboard

* Add/Edit university blocs
* Add/Edit college blocs
* Duplicate detection
* Blockchain synchronization

---

## 🏗 System Architecture

<img width="1483" height="946" alt="{7E3EA03A-3BE1-47A3-BEC5-1C82AE60A9C5}" src="https://github.com/user-attachments/assets/1b45d51a-2e68-4865-8f67-3a98726db543" />


---

## 🔗 Smart Contract Design

The `VotingSystem.sol` contract:

* Maps voter wallet addresses to voting status
* Prevents double voting using address validation
* Stores vote counts on-chain
* Uses keccak256 hashing
* Synchronizes with backend (hybrid model)

Solidity Version: **0.8.13**

---

## 🛠 Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript (ES6+)
* Chart.js
* Ethers.js

### Backend

* Node.js
* Express.js
* MySQL
* JWT
* bcrypt

### Blockchain

* Solidity
* Truffle
* Ganache
* Web3.js

---

## ⚙️ Installation

### Prerequisites

* Node.js v18+
* MySQL v8+
* Ganache v7+
* MetaMask extension

---

### 1️⃣ Clone Repository


git clone https://github.com/yourusername/decentralized-voting-system.git
cd decentralized-voting-system


---

### 2️⃣ Install Dependencies

in your vs code terminal write this command

npm install express body-parser mysql2 cors bcryptjs jsonwebtoken ethers web3 dotenv
---



### 3️⃣ Database Setup

```sql
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
```

---

### 4️⃣ Create `.env` File

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=amitdb
JWT_SECRET=your_secure_secret_key
PORT=5500
```

---

### 5️⃣ Blockchain Setup

```bash
cd blockchain
truffle compile
truffle migrate --network development
```

---

### 6️⃣ Run Server

```bash
node backendwauto.js
```

Open in browser:

```
http://localhost:5500
```

---

## 👤 Usage

### Student Flow

1. Login
2. Connect MetaMask
3. Select blocs
4. Confirm transaction
5. View results

### Admin Flow

1. Login as admin
2. Manage blocs
3. Monitor voting
4. View analytics

---

## 🔌 API Endpoints

| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| POST   | /login                  | User login           |
| GET    | /university-blocs       | Get university blocs |
| GET    | /college-blocs/:college | Get college blocs    |
| POST   | /submit-vote            | Submit vote          |
| GET    | /results                | Get results          |
| POST   | /admin/university-blocs | Add university bloc  |
| POST   | /admin/college-blocs    | Add college bloc     |

---

## 🧠 Future Improvements

* Deploy to Ethereum testnet (Sepolia)
* Add election time window
* Dockerize deployment
* Gas optimization
* CI/CD integration

---

## 👨‍💻 Contributors

* **Omar Durrah**
* **Mohammad Saleem**

### Academic Supervisor

* **Dr. Ramze Saifan**

---

## 📜 License

MIT License

---

<div align="center">

نظام تصويت جامعي لامركزي آمن وشفاف

⭐ Star the repository if you like it ⭐

</div>



