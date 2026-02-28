require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ethers } = require("ethers");
const crypto = require('crypto');
const fs = require('fs');
const { Web3 } = require('web3');
const app = express();
app.use(bodyParser.json());
app.use(cors());

// ------------------------------
// Connect to Ethereum Blockchain
// ------------------------------
const web3 = new Web3('http://127.0.0.1:7545');

// Load contract ABI and address dynamically from Truffle build
//const contractJson = JSON.parse(fs.readFileSync('./build/contracts/VotingSystem.json', 'utf8'));
const path = require('path');

// Go up one level to reach the project root, then into blockchain/build
const artifactPath = path.join(
  __dirname,                // folder where this .js file lives
  '..',                     // go up to project root
  'blockchain',
  'build',
  'contracts',
  'VotingSystem.json'
);

const contractJson = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));const contractABI = contractJson.abi;
const networkId = Object.keys(contractJson.networks)[0]; // Get first deployed network

if (!networkId) {
    console.error("❌ Contract is not deployed to any network.");
    process.exit(1);
}

const contractAddress = contractJson.networks[networkId].address; // Get deployed contract address

console.log("📌 Contract Address:", contractAddress); // Debugging purpose

// Create contract instance
const contract = new web3.eth.Contract(contractABI  ,  contractAddress);

// ------------------------------
// ✅ Connect to MySQL Database
// ------------------------------
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  port: 3306
});

// ✅ Establish MySQL Connection
db.connect(err => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err);
    return;
  }
  console.log('✅ Connected to MySQL Database');
});

app.use(bodyParser.json());
app.use(cors());

// ------------------------------
// Login route (POST /login)
// ------------------------------
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log("📤 Received Login Request:", { email, password });

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('❌ Error fetching user:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(402).json({ success: false, message: 'Invalid credentials' });
    }

    const user = results[0];

    // ✅ Secure password comparison using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const role = user.email === 'admin@voting.com' ? 'admin' : user.role || 'user';
    const token = jwt.sign({ userId: user.id, role }, process.env.JWT_SECRET, { expiresIn: '1h' }); //JWT_SECRET should be set in .env file

    return res.json({ // Send role to frontend
      success: true,
      message: 'Login successful',
      token: token,
      college: user.college,
      role: role
    });
  });
});

async function syncUniversityBlocs() {
  try {
    const query = "SELECT id FROM university_blocs";
    db.query(query, async (err, results) => {
      if (err) {
        console.error("❌ Error fetching bloc IDs:", err);
        return;
      }

      const blocIds = results.map(row => row.id);
      console.log("📌 Bloc IDs from DB:", blocIds);

      const account = await getAccount();

      for (let blocId of blocIds) {
        try {
          await contract.methods.addUniversityBloc(blocId).send({ from: account, gas: 300000 });
          console.log(`✅ Bloc ${blocId} added to blockchain`);
        } catch (error) {
          console.log(`❌ Failed to add bloc ${blocId}: ${error.message}`);
        }
      }

      console.log("✅ University blocs synced to blockchain!");
    });
  } catch (error) {
    console.error("❌ Error syncing university blocs:", error);
  }
}

// ------------------------------
// ✅ Sync College Blocs to Blockchain
// ------------------------------
async function syncCollegeBlocs() {
  try {
    const query = "SELECT id FROM college_blocs";
    db.query(query, async (err, results) => {
      if (err) {
        console.error("❌ Error fetching college bloc IDs:", err);
        return;
      }

      const blocIds = results.map(row => row.id);
      console.log("📌 College Bloc IDs from DB:", blocIds);

      const account = await getAccount();

      for (let blocId of blocIds) {
        try {
          await contract.methods.addCollegeBloc(blocId).send({ from: account, gas: 300000 });
          await new Promise(r => setTimeout(r, 200));
          console.log(`✅ College Bloc ${blocId} added to blockchain`);
        } catch (error) {
          console.log(`❌ Failed to add college bloc ${blocId}: ${error.message}`);
        }
      }

      console.log("✅ College blocs synced to blockchain!");
    });
  } catch (error) {
    console.error("❌ Error syncing college blocs:", error);
  }
}

syncUniversityBlocs();
syncCollegeBlocs();

// ✅ Fetch University Blocs for frontend dropdown (replaces old /candidates route)
app.get('/candidates', (req, res) => {
  const query = "SELECT id, name as candidate FROM university_blocs";
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching university blocs:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
    console.log("📌 Retrieved University Blocs:", results); // Debugging

    res.json({ success: true, candidates: results });
  });
});

app.get('/college-blocs-chart', (req, res) => {
  const college = req.query.college;
  let query = "SELECT id, name as candidate FROM college_blocs";
  let params = [];

  if (college) {
    query += " WHERE college = ?";
    params.push(college);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ Error fetching college blocs:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
    res.json({ success: true, college_blocs: results });
  });
});


// ✅ send transactions (Ganache)
const getAccount = async () => {
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
};

// ------------------------------
// ✅ JWT Authentication Middleware
// ------------------------------
function authenticateToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({ success: false, message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }
    req.user = user;
    next();
  });
}

// ✅ Fetch college blocs by college
app.get('/college-blocs/:college', (req, res) => {
  const college = req.params.college;
  const query = "SELECT * FROM college_blocs WHERE college = ?";
  db.query(query, [college], (err, results) => {
    if (err) {
      console.error("❌ Error fetching college blocs:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
    res.json({ success: true, blocs: results });
  });
});

// ------------------------------
// ✅ Start Express Server
// ------------------------------
const PORT = process.env.PORT || 5500;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://172.28.128.1:${PORT}`);
});


// ✅ Submit both university and college vote
app.post('/submit-vote', (req, res) => {
  const { userId, universityBlocId, collegeBlocId } = req.body;

  if (!userId || !universityBlocId || !collegeBlocId) {
    return res.status(400).json({ success: false, message: 'Missing vote data' });
  }

  const insertQuery = `
    INSERT INTO votes (user_id, university_bloc_id, college_bloc_id)
    VALUES (?, ?, ?)
  `;

  db.query(insertQuery, [userId, universityBlocId, collegeBlocId], (err, result) => {
    if (err) {
      console.error("❌ Error inserting vote:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    res.json({ success: true, message: "✅ Votes submitted successfully!" });
  });
});

// ✅ Fetch vote results for both university and college
// ✅ In-memory cache
let resultsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 15 * 1000; // 15 seconds

// ✅ Unified /results endpoint
app.get("/results", async (req, res) => {
  const collegeFilter = req.query.college || null;
  const now = Date.now();

  // ✅ Serve cached result if no college filter and cache is still valid
  if (!collegeFilter && resultsCache && now - cacheTimestamp < CACHE_DURATION_MS) {
    return res.json(resultsCache);
  }

  try {
    const account = await getAccount();
    console.log("📩 Fetching results for:", collegeFilter || "all colleges");

    // 🔵 University Blocs
    const universityRows = await new Promise((resolve, reject) => {
      db.query("SELECT id, name FROM university_blocs", (err, results) =>
        err ? reject(err) : resolve(results)
      );
    });

    const universityResults = [];
    for (const row of universityRows) {
      try {
        const result = await contract.methods.getUniversityBloc(row.id).call({ from: account });
        universityResults.push({
          id: row.id,
          name: row.name,
          count: parseInt(result[1].toString())
        });
      } catch (err) {
        console.warn(`⚠️ Failed to get vote count for university bloc ID ${row.id}`, err);
      }
    }

    // 🟢 College Blocs
    let collegeQuery = "SELECT id, name, college FROM college_blocs";
    const collegeParams = [];

    if (collegeFilter) {
      collegeQuery += " WHERE college = ?";
      collegeParams.push(collegeFilter);
    }

    const collegeRows = await new Promise((resolve, reject) => {
      db.query(collegeQuery, collegeParams, (err, results) =>
        err ? reject(err) : resolve(results)
      );
    });

    const collegeResults = [];
    for (const row of collegeRows) {
      try {
        const result = await contract.methods.getCollegeBloc(row.id).call({ from: account });
        collegeResults.push({
          id: row.id,
          name: row.name,
          college: row.college,
          count: parseInt(result[1].toString())
        });
      } catch (err) {
        console.warn(`⚠️ Failed to get vote count for college bloc ID ${row.id}`, err);
      }
    }

    // ✅ Final Response
    const response = {
      success: true,
      university: universityResults,
      college: collegeResults
    };

    if (!collegeFilter) {
      resultsCache = response;
      cacheTimestamp = Date.now();
    }

    res.json(response);
  } catch (error) {
    console.error("❌ Fatal error in /results:", error);
    res.status(500).json({ success: false, message: "Server error, please try again later." });
  }
});

app.get("/all-colleges", (req, res) => {
  db.query("SELECT DISTINCT college FROM college_blocs", (err, results) => {
    if (err) {
      console.error("❌ Error fetching colleges:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const colleges = results.map(row => row.college).filter(Boolean); // remove nulls if any
    res.json({ success: true, colleges });
  });
});

// ✅ Get all university blocs (public - for frontend display without MetaMask)
app.get('/university-blocs', (req, res) => {
  console.log("📡 GET /university-blocs request received");

  db.query('SELECT id, name FROM university_blocs', (err, results) => {
    if (err) {
      console.error('❌ Error fetching university blocs:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }

    console.log("📥 University blocs fetched:", results);
    res.json({ success: true, blocs: results });
  });
});

// === ADMIN ROUTES ===
app.post("/admin/university-blocs", (req, res) => {
  const { name } = req.body;

  // Step 1: Validate input
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ success: false, message: "Name is required and must be a valid string." });
  }
  const trimmedName = name.trim();

  // Step 2: Check for duplicate bloc name
  const checkQuery = "SELECT * FROM university_blocs WHERE name = ?";
  db.query(checkQuery, [trimmedName], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("❌ Error checking for existing university bloc:", checkErr);
      return res.status(500).json({ success: false, message: "Database check error" });
    }

    if (checkResults.length > 0) {
      console.warn("⚠️ University bloc already exists:", trimmedName);
      return res.status(409).json({ success: false, message: "This bloc already exists." });
    }

    // Step 3: Insert into database
    const insertQuery = "INSERT INTO university_blocs (name) VALUES (?)";
    db.query(insertQuery, [trimmedName], (insertErr, result) => {
      if (insertErr) {
        console.error("❌ Error inserting university bloc:", insertErr);
        return res.status(500).json({ success: false, message: "Insert failed" });
      }

      console.log("✅ University bloc added with ID:", result.insertId);
      return res.json({ success: true, id: result.insertId });
    });
  });
});


// List university blocs
app.get("/admin/university-blocs", (req, res) => {
  db.query("SELECT * FROM university_blocs", (err, results) => {
    if (err) {
      console.error("❌ Error fetching university blocs:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, blocs: results });
  });
});

// Add university bloc
app.post("/admin/college-blocs", (req, res) => {
  const { name, college } = req.body;

  if (!name || !college) {
    return res.status(400).json({ success: false, message: "Missing name or college" });
  }

  // 🔍 Step 1: Check for existing college bloc with same name & college
  const checkQuery = "SELECT * FROM college_blocs WHERE name = ? AND college = ?";
  db.query(checkQuery, [name, college], (checkErr, results) => {
    if (checkErr) {
      console.error("❌ Error checking existing college bloc:", checkErr);
      return res.status(500).json({ success: false, message: "Database check error" });
    }

    if (results.length > 0) {
      // ❌ Duplicate found
      return res.json({ success: false, message: "This bloc already exists." });
    }

    // ✅ Step 2: Insert if not duplicate
    db.query(
      "INSERT INTO college_blocs (name, college) VALUES (?, ?)",
      [name, college],
      (err, result) => {
        if (err) {
          console.error("❌ Error adding college bloc:", err);
          return res.status(500).json({ success: false });
        }

        const id = result.insertId;
        console.log("✅ College bloc added with ID:", id);
        res.json({ success: true, id });
      }
    );
  });
});

// Edit university bloc name
app.put("/admin/university-blocs/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.query("UPDATE university_blocs SET name = ? WHERE id = ?", [name, id], (err) => {
    if (err) {
      console.error("❌ Error updating university bloc:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

// List college blocs
app.get("/admin/college-blocs", (req, res) => {
  db.query("SELECT * FROM college_blocs", (err, results) => {
    if (err) {
      console.error("❌ Error fetching college blocs:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, blocs: results });
  });
});

// Add college bloc
app.post("/admin/college-blocs", (req, res) => {
  const { name, college } = req.body;

  if (!name || !college) {
    return res.status(400).json({ success: false, message: "Missing name or college" });
  }

  db.query(
    "INSERT INTO college_blocs (name, college) VALUES (?, ?)",
    [name, college],
    (err, result) => {
      if (err) {
        console.error("❌ Error adding college bloc:", err);
        return res.status(500).json({ success: false });
      }

      const id = result.insertId; // ✅ get the new bloc ID
      console.log("✅ College bloc added with ID:", id);
      res.json({ success: true, id }); // ✅ send it back
    }
  );
});

// Edit college bloc name
app.put("/admin/college-blocs/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.query("UPDATE college_blocs SET name = ? WHERE id = ?", [name, id], (err) => {
    if (err) {
      console.error("❌ Error updating college bloc:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

// ✅ Get distinct college names from college_blocs table
app.get("/colleges", (req, res) => {
  db.query("SELECT DISTINCT college FROM college_blocs", (err, results) => {
    if (err) {
      console.error("❌ Error fetching colleges:", err);
      return res.status(500).json({ success: false });
    }

    const colleges = results.map(row => row.college);
    res.json({ success: true, colleges });
  });
});