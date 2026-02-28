// ✅ Role Check
const role = localStorage.getItem("role");
console.log("👤 Detected role:", role);
if (role !== "admin") {
  alert("Access denied. Admins only.");
  window.location.href = "index.html";
}

let chartInstances = {};
let contract;
let signer;
const BASE_URL = 'http://192.168.209.171:5500';

// ✅ Load Smart Contract
async function loadAdminContract() {
  try {
    console.log("📦 Loading contract ABI...");
    //const res = await fetch("../blockchain/build/contracts/VotingSystem.json");
    const res = await fetch("./abi/VotingSystem.json");
    const json = await res.json();
    const contractABI = json.abi;

    if (typeof window.ethereum !== "undefined") {
      console.log("🔗 Connecting to MetaMask...");
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      const network = await provider.getNetwork();
      console.log("🌐 Network:", network);

      const contractAddress = json.networks[network.chainId].address;
      console.log("📍 Contract Address:", contractAddress);

      contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log("✅ Admin contract loaded successfully!", contract);
    } else {
      console.error("❌ MetaMask not detected!");
    }
  } catch (err) {
    console.error("🚨 Error loading contract:", err);
  }
}

// ✅ Add University Bloc (MySQL + Blockchain)
document.getElementById("university-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("university-name").value.trim();
  const successMsg = document.getElementById("univ-success");
  const errorMsg = document.getElementById("univ-error");

  // 🔄 Reset previous messages
  successMsg.classList.add("hidden");
  errorMsg.classList.add("hidden");

  if (!name) {
    errorMsg.textContent = "⚠️ Please enter a university bloc name.";
    errorMsg.classList.remove("hidden");
    setTimeout(() => errorMsg.classList.add("hidden"), 3000);
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/university-blocs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    // ❌ Handle conflict (duplicate entry)
    if (res.status === 409) {
      const data = await res.json();
      errorMsg.textContent = data.message || "⚠️ This university bloc already exists.";
      errorMsg.classList.remove("hidden");
      setTimeout(() => errorMsg.classList.add("hidden"), 3000);
      return; // 🚫 Stop execution
    }

    const data = await res.json();
    console.log("📥 MySQL response:", data);

    if (!data.success || !data.id) throw new Error("MySQL insert failed or missing ID");

    const blocId = data.id;
    const account = await signer.getAddress();
    console.log(`📤 Adding bloc to blockchain with ID: ${blocId} from account: ${account}`);
    await contract.addUniversityBloc(blocId);
    console.log("✅ Blockchain: University bloc added");

    document.getElementById("university-name").value = "";

    await loadUniversityBlocs();
    await fetchAdminVoteResults();

    successMsg.textContent = "✅ University bloc added!";
    successMsg.classList.remove("hidden");
    setTimeout(() => successMsg.classList.add("hidden"), 2000);

  } catch (err) {
    console.error("❌ Error adding university bloc:", err);
    errorMsg.textContent = "❌ Error adding university bloc: " + err.message;
    errorMsg.classList.remove("hidden");
    setTimeout(() => errorMsg.classList.add("hidden"), 3000);
  }
});

// ✅ Add College Bloc (MySQL + Blockchain)
document.getElementById("college-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("college-name").value;
  const college = document.getElementById("college-type").value;
  console.log("📝 Adding college bloc:", { name, college });

  try {
    // 1️⃣ Save to MySQL
    const res = await fetch(`${BASE_URL}/admin/college-blocs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, college }),
    });

    const data = await res.json();
    console.log("📥 MySQL college bloc response:", data);

    // ❌ If duplicate
    if (res.status === 409 || data.message === "This bloc already exists.") {
      alert("⚠️ This bloc already exists.");
      return;
    }

    // ✅ Step 2: Check if ID exists before using it
    if (!data.success || !data.id) throw new Error("MySQL insert failed or missing ID");

    // 2️⃣ Save to Blockchain
    const blocId = data.id;
    const account = await signer.getAddress();
    console.log(`📤 Adding college bloc to blockchain with ID: ${blocId} from account ${account}`);
    await contract.addCollegeBloc(blocId);
    console.log("✅ Blockchain: College bloc added");

    // 3️⃣ UI updates
    document.getElementById("college-name").value = "";
    document.getElementById("college-type").value = "";

    await loadCollegeBlocs();
    await fetchAdminVoteResults();

    // 🔁 Refresh the college <select> dropdown if available
    if (typeof populateAdminCollegeDropdown === "function") {
      await populateAdminCollegeDropdown();
    }

    const msg = document.getElementById("college-success");
    msg.classList.remove("hidden");
    setTimeout(() => msg.classList.add("hidden"), 2000);
  } catch (err) {
    console.error("❌ Error adding college bloc:", err);
    alert("❌ Error adding college bloc: " + err.message);
  }
});

// ✅ Load University Blocs
async function loadUniversityBlocs() {
  console.log("📊 Loading university blocs...");
  try {
    const res = await fetch(`${BASE_URL}/admin/university-blocs`);
    const data = await res.json();
    const table = document.getElementById("university-table");

    table.innerHTML = `<tr><th>ID</th><th>Name</th><th>Action</th></tr>`;
    data.blocs.forEach((bloc) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${bloc.id}</td>
        <td><input type="text" value="${bloc.name}" id="univ-edit-${bloc.id}" /></td>
        <td><button onclick="updateUniversityBloc(${bloc.id}, event)" class="animated-btn">Save</button></td>
      `;
      table.appendChild(row);
    });
    console.log("✅ University blocs loaded:", data.blocs);
  } catch (err) {
    console.error("❌ Failed to load university blocs:", err);
  }
}

// ✅ Load College Blocs
async function loadCollegeBlocs() {
  console.log("📊 Loading college blocs...");
  try {
    const res = await fetch(`${BASE_URL}/admin/college-blocs`);
    const data = await res.json();
    const table = document.getElementById("college-table");

    table.innerHTML = `<tr><th>ID</th><th>Name</th><th>College</th><th>Action</th></tr>`;
    data.blocs.forEach((bloc) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${bloc.id}</td>
        <td><input type="text" value="${bloc.name}" id="col-edit-${bloc.id}" /></td>
        <td>${bloc.college}</td>
        <td><button onclick="updateCollegeBloc(${bloc.id}, event)" class="animated-btn">Save</button></td>
      `;
      table.appendChild(row);
    });
    console.log("✅ College blocs loaded:", data.blocs);
  } catch (err) {
    console.error("❌ Failed to load college blocs:", err);
  }
}

// ✅ Update University Bloc Name
async function updateUniversityBloc(id, event) {
  const name = document.getElementById(`univ-edit-${id}`).value;
  console.log(`🛠️ Updating university bloc ID ${id} to "${name}"`);

  try {
    const res = await fetch(`${BASE_URL}/admin/university-blocs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();

    const btn = event.target;
    if (data.success) {
      console.log("✅ University bloc updated:", data);
      btn.textContent = "✅ Saved!";
      setTimeout(() => (btn.textContent = "Save"), 1500);
    } else {
      throw new Error("Update failed");
    }
  } catch (err) {
    console.error("❌ Failed to update university bloc:", err);
    alert("❌ Failed to update university bloc.");
  }
}

// ✅ Update College Bloc Name
async function updateCollegeBloc(id, event) {
  const name = document.getElementById(`col-edit-${id}`).value;
  console.log(`🛠️ Updating college bloc ID ${id} to "${name}"`);

  try {
    const res = await fetch(`${BASE_URL}/admin/college-blocs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();

    const btn = event.target;
    if (data.success) {
      console.log("✅ College bloc updated:", data);
      btn.textContent = "✅ Saved!";
      setTimeout(() => (btn.textContent = "Save"), 1500);
    } else {
      throw new Error("Update failed");
    }
  } catch (err) {
    console.error("❌ Failed to update college bloc:", err);
    alert("❌ Failed to update college bloc.");
  }
}

loadAdminContract();
loadUniversityBlocs();
loadCollegeBlocs();
populateAdminCollegeDropdown();
fetchAdminVoteResults(); // optionally default to all

// ✅ Sign out
document.getElementById("sign-out").addEventListener("click", () => {
  console.log("👋 Signing out...");
  localStorage.clear();
  window.location.href = "index.html";
});

// 🌙 Theme toggle
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  const body = document.body;
  body.classList.toggle("dark");
  body.classList.toggle("light");
  themeToggle.textContent = body.classList.contains("dark") ? "☀️" : "🌙";
  console.log("🎨 Theme toggled:", body.classList.contains("dark") ? "Dark" : "Light");
});


function drawChart(canvasId, title, voteMap) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const labels = Object.keys(voteMap);
  const counts = Object.values(voteMap);
  const maxCount = Math.max(...counts);

  const labelsWithWinners = labels.map((label, i) =>
    counts[i] === maxCount ? `🏆 ${label}` : label
  );

  const backgroundColors = counts.map((count) =>
    count === maxCount ? 'rgba(255, 215, 0, 0.8)' : 'rgba(54, 162, 235, 0.5)'
  );

  const borderColors = counts.map((count) =>
    count === maxCount ? 'rgba(255, 215, 0, 1)' : 'rgba(54, 162, 235, 1)'
  );

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labelsWithWinners,
      datasets: [{
        label: title,
        data: counts,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, precision: 0 }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: title
        }
      }
    }
  });
}

async function fetchAdminVoteResults(selectedCollege = "") {
  try {
    let url = `${BASE_URL}/results`;
    if (selectedCollege) {
      url += `?college=${selectedCollege}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data.success) throw new Error("Failed to fetch vote results");

    // University data (doesn't change)
    const universityMap = {};
    data.university.forEach(bloc => {
      universityMap[bloc.name] = bloc.count;
    });
    drawChart("adminUniversityChart", "University Bloc Results", universityMap);

    // College chart — filtered
    const collegeMap = {};
    data.college.forEach(bloc => {
      collegeMap[bloc.name] = bloc.count;
    });
    drawChart("adminCollegeChart", `College Bloc Results ${selectedCollege ? `(${selectedCollege})` : ""}`, collegeMap);

  } catch (err) {
    console.error("❌ Error loading admin charts:", err);
  }
}

async function populateAdminCollegeDropdown() {
  try {
    const res = await fetch(`${BASE_URL}/colleges`);
    const data = await res.json();

    const dropdown = document.getElementById("admin-college-dropdown");
    dropdown.innerHTML = ""; // ❌ No "All Colleges"

    data.colleges.forEach(college => {
      const option = document.createElement("option");
      option.value = college;
      option.textContent = college;
      dropdown.appendChild(option);
    });

    if (data.colleges.length > 0) {
      dropdown.value = data.colleges[0]; // auto-select first
      fetchAdminVoteResults(data.colleges[0]);
    }

    dropdown.addEventListener("change", () => {
      fetchAdminVoteResults(dropdown.value);
    });

    console.log("📚 Admin college dropdown populated:", data.colleges);
  } catch (err) {
    console.error("❌ Failed to load college list:", err);
  }
}