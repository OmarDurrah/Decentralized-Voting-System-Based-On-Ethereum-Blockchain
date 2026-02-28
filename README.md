
# 🗳️ Decentralized University Voting System
<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?logo=ethereum&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)


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
as you can see in the figure below 

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
* truffle 

---

### 1️⃣ Clone Repository


git clone https://github.com/OmarDurrah/decentralized-voting-system.git
cd decentralized-voting-system


---

### 2️⃣ Install Dependencies

in your VScode terminal write this command, make sure that you are in the correct path

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

JWT_SECRET=your_super_secret_jwt_key_here_change_this
PORT=5500

```

---


## 5️⃣ 🦊 MetaMask Setup Guide

This project requires **MetaMask** to sign blockchain transactions and interact with the smart contract deployed on Ganache.

---

###  Install MetaMask

1. Visit the official website: https://metamask.io
2. Install the browser extension (Chrome / Edge / Firefox).
3. Create a new wallet.
4. Securely store your Secret Recovery Phrase.

---

###  Configure Local Blockchain (Ganache)

After starting Ganache:

- RPC Server: `http://127.0.0.1:7545` (or your configured port)
- Chain ID: `5777` (default for Ganache)
- Currency Symbol: `ETH`

---

###  Add Ganache Network to MetaMask

1. Open MetaMask.
2. Click on the network dropdown (top-left).
3. Select **Add Network**.
4. Choose **Add a network manually**.
5. Enter the following:

| Field | Value |
|-------|-------|
| Network Name | Ganache Local |
| New RPC URL | http://127.0.0.1:7545 |
| Chain ID | 5777 |
| Currency Symbol | ETH |

6. Click **Save**.

---

###  Import Ganache Account

1. Open Ganache.
2. Copy one of the **private keys**.
3. Open MetaMask.
4. Click on the account icon.
5. Select **Import Account**.
6. Paste the private key.
7. Confirm.

You should now see the imported account with test ETH balance.

---

###  Connect to the Application

1. Start the backend server.
2. Open `http://localhost:5500`
3. Click **Connect Wallet**.
4. Approve the MetaMask connection.
5. Confirm transactions when voting.

---

### ⚠️ Important Notes

- Make sure MetaMask is connected to the **Ganache Local** network.
- Ensure the Chain ID matches Ganache.
- If transactions fail, verify that the contract was successfully deployed.
- Always restart MetaMask after changing networks if issues occur.

---

MetaMask is required for:
- Signing vote transactions
- Preventing double voting
- Verifying wallet identity
- Interacting with the deployed smart contract

---

###  Blockchain Setup

---
first of all open ganache, it should be like this , 
the first figue shows the UI of the ganache,
the secone displays the configuration and it could be difference from device to other
--
<img width="909" height="608" alt="{D890BEE1-3D83-499B-B896-4C537541D77C}" src="https://github.com/user-attachments/assets/9805d7da-1c94-4c7b-9fb1-2d7af420763f" />




<img width="2297" height="898" alt="{BE214A8B-CD06-4EC9-A1FF-AD2F91578CB2}" src="https://github.com/user-attachments/assets/909499a5-b26b-42aa-8620-227252ca685f" />


!IMPORTANT!:keep in your mind, the configuration could be different from device to other, for example i used PORT=55OO in your device this port could be alreday used the same thing as backnd and dadtabase!
--
now you are ready for compile your contracts
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


->as you can see in the figure below<-
--


<img width="944" height="1221" alt="{FB394219-E15F-45BC-AFB9-E75FCA97C1BC}" src="https://github.com/user-attachments/assets/667398f6-27d2-4f37-ae8e-0f69496efeef" />



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

Copyright (c) 2026 Omar Al Durrah, Dr. Ramzi Saifan, Mohammad Saleem

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

<div align="center">

نظام تصويت جامعي لامركزي آمن وشفاف

⭐ Star the repository if you like it ⭐

</div>
