let chartInstances = {};
let contract;
let signer;

let isMetaMaskRequestPending = false;

async function loadContract() {
  if (isMetaMaskRequestPending) {
    console.warn("⏳ MetaMask request already in progress...");
    return;
  }

  try {
    console.log("🔄 Fetching Contract Address from Blockchain...");
    const abiResponse = await fetch('./abi/VotingSystem.json');
    if (!abiResponse.ok) throw new Error("❌ Failed to fetch VotingSystem.json");
    const contractJson = await abiResponse.json();
    const contractABI = contractJson.abi;

    if (typeof window.ethereum !== "undefined") {
      console.log("🔗 Connecting to MetaMask...");
      isMetaMaskRequestPending = true;
      await window.ethereum.request({ method: "eth_requestAccounts" });
      isMetaMaskRequestPending = false;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      const network = await provider.getNetwork();
      const networkId = network.chainId;

      console.log("📌 Network ID:", networkId);

      if (!contractJson.networks[networkId]) {
        throw new Error(`❌ Contract not deployed on network ${networkId}`);
      }

      const contractAddress = contractJson.networks[networkId].address;
      console.log("📌 Contract Address Found:", contractAddress);

      contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log("✅ Contract Loaded Successfully:", contract);
    } else {
      alert("❌ MetaMask is not installed.");
    }
  } catch (error) {
    isMetaMaskRequestPending = false;
    console.error("❌ Error loading contract:", error);
  }
}

const BASE_URL = 'http://127.0.0.1:5500';

async function fetchCandidates() {
try {
    const response = await fetch(`${BASE_URL}/candidates`);
    const data = await response.json();

    if (data.success) {
        console.log("the  data is ",data.candidates); // Debugging: Check what the API returns
        const candidateList = document.querySelector('.candidate-list');
        candidateList.innerHTML = ''; // Clear existing candidates

        data.candidates.forEach(candidate => {
            const label = document.createElement('label');
            label.className = 'candidate-card';
            label.innerHTML = `
                <input type="radio" name="candidate" value="${candidate.id}" required>
                <span>${candidate.name || candidate.candidate}</span> <!-- Fix Here -->
            `;
            candidateList.appendChild(label);
        });

        console.log("✅ Candidates loaded successfully!");
    } else {
        console.error("❌ Failed to load candidates:", data.message);
    }
} catch (error) {
    console.error("🚨 Error fetching candidates:", error);
}
}

async function renderCollegeBlocOptions() {
const college = localStorage.getItem("userCollege");
console.log("the student's college" , college) ;
const container = document.querySelector(".college-bloc-list");

if (!college || !container) return;

container.innerHTML = ""; // Clear previous options

try {
  const response = await fetch(`${BASE_URL}/college-blocs/${college}`);
  const data = await response.json();
  console.log("the data is " , data)
  console.log(data.blocs);

  if (!data.success) {
    console.error("❌ Failed to fetch college blocs");
    return;
  }

  data.blocs.forEach((bloc) => {
    const label = document.createElement("label");
    label.classList.add("candidate-card", "university-card");
    label.innerHTML = `
      <input type="radio" name="collegeBloc" value="${bloc.name}" data-blocid="${bloc.id}" required>
      <span>${bloc.name}</span>
    `;
    container.appendChild(label);
  });

} catch (error) {
  console.error("❌ Error fetching college bloc options:", error);
}
}

// -------------------------
// Theme Toggle
// -------------------------
document.getElementById('theme-toggle').addEventListener('click', () => {
  const body = document.body;
  if (body.classList.contains('light')) {
    body.classList.remove('light');
    body.classList.add('dark');
    document.getElementById('theme-toggle').textContent = '☀️';
  } else {
    body.classList.remove('dark');
    body.classList.add('light');
    document.getElementById('theme-toggle').textContent = '🌙';
  }
});

// -------------------------
// Show/Hide Password with Focus Retention
// -------------------------
document.getElementById('toggle-password').addEventListener('click', () => {
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eye-icon');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.innerHTML = `
      <path d="M17.94 17.94A10.29 10.29 0 0 1 12 20c-7 0-11-8-11-8a19.73 19.73 0 0 1 4.34-5.94" />
      <line x1="1" y1="1" x2="23" y2="23" />
    `;
  } else {
    passwordInput.type = 'password';
    eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    `;
  }
  passwordInput.focus();
});
// ✅ Utility: Check if user has already voted on the blockchain
async function checkIfAlreadyVoted(walletAddress = null) {
  try {
    const address = walletAddress || await signer.getAddress();
    const voter = await contract.voters(address);

    // Access struct fields by index
    const hasVotedUniversity = voter[0];
    const hasVotedCollege = voter[1];

    return hasVotedUniversity || hasVotedCollege;
  } catch (err) {
    console.error("❌ Failed to check vote status from blockchain:", err);
    return false;
  }
}

async function renderUniversityBlocOptions() {
  try {
    const response = await fetch(`${BASE_URL}/university-blocs`);
    const data = await response.json();

    if (!data.success) throw new Error("Failed to fetch university blocs");

    const container = document.querySelector(".candidate-list"); // make sure this class exists in your HTML
    container.innerHTML = "";

    data.blocs.forEach(bloc => {
      const label = document.createElement("label");
      label.classList.add("candidate-card");
      label.innerHTML = `
        <input type="radio" name="candidate" value="${bloc.id}" required>
        <span>${bloc.name}</span>
      `;
      container.appendChild(label);
    });

  } catch (error) {
    console.error("❌ Error loading university blocs:", error);
  }
}

// -------------------------
// Login Form Submission using Fetch
// -------------------------
document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log("📤 Sending Login Request:", { email, password });

  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    console.log("📥 Received Response:", response);

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("❌ Failed to parse JSON:", jsonError);
      alert('⚠️ Server returned invalid response. Please try again later.');
      return;
    }

    console.log("📊 Parsed JSON Data:", data);

    if (data.success) {
      console.log("✅ Login successful!");
      const currentEmail = email;
      const previousEmail = localStorage.getItem("loggedEmail");

      // ✅ If a different user logs in, clean up only their scoped data
      if (previousEmail && previousEmail !== currentEmail) {
        localStorage.removeItem(`votedUniversityName_${previousEmail}`);
        localStorage.removeItem(`votedCollegeName_${previousEmail}`);
        localStorage.removeItem(`wallet_${previousEmail}`);
      }

      // ✅ Save new login session info
      localStorage.setItem("userCollege", data.college);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("loggedEmail", currentEmail);

      // ✅ Redirect admin
      if (data.role === "admin") {
        console.log("👨‍💼 Admin detected, redirecting to admin.html");
        window.location.href = "admin.html";
        return;
      }

      // ✅ Show user interface
      document.getElementById('login-section').classList.add('hidden');
      document.getElementById('voting-section').classList.remove('hidden');
      document.getElementById("vote-results").classList.remove("hidden");
      document.getElementById('sign-out').classList.remove('hidden');
      document.getElementById("user-email").innerText = `Logged in as: ${currentEmail}`;

      // ✅ Render backend-only UI (safe even before wallet)
      renderUniversityBlocOptions();
      renderCollegeBlocOptions();         // ⬅ shows college bloc names
      await fetchVotesAndDrawChart(); // ✅ Correct function name in your code


      // ✅ THEN try MetaMask and blockchain functions
      await loadContract();
      if (!signer) {
        alert("❌ Wallet connection failed. Please unlock MetaMask and try again.");
        return;
      }
      const walletAddress = await signer.getAddress();
      localStorage.setItem(`wallet_${currentEmail}`, walletAddress);

      fetchCandidates(); // From blockchain
      const alreadyVoted = await checkIfAlreadyVoted(walletAddress);

      if (alreadyVoted) {
        const uniVote = localStorage.getItem(`votedUniversityName_${currentEmail}`);
        const colVote = localStorage.getItem(`votedCollegeName_${currentEmail}`);

        document.getElementById("voted-candidate").innerText =
          uniVote && colVote
            ? `You voted for: University: ${uniVote} | College: ${colVote}`
            : "You have already voted.";

        console.warn("⚠️ Blockchain confirms this user has already voted. Email:", currentEmail);
      } else {
        document.getElementById("voted-candidate").innerText = "You have not voted yet.";
      }

      populateCollegeDropdown();

    } else {
      console.log("❌ Login failed:", data.message);
      alert('❌ Invalid credentials');
    }
  } catch (error) {
    console.error("🚨 Error logging in:", error);
    alert('❌ Error logging in. Please try again later.');
  }
});

// -------------------------
// Handle Sign Out
// -------------------------
document.getElementById('sign-out').addEventListener('click', () => {
  console.log("🚪 User signed out!");

  const currentEmail = localStorage.getItem("loggedEmail");

  // ✅ Clean only current user's vote data
  if (currentEmail) {
    localStorage.removeItem(`votedUniversityName_${currentEmail}`);
    localStorage.removeItem(`votedCollegeName_${currentEmail}`);
    localStorage.removeItem("loggedEmail");
  }

  // ✅ Clean session data
  localStorage.removeItem("userCollege");
  localStorage.removeItem("token");
  localStorage.removeItem("role");

  // ✅ Reset UI
  document.getElementById('voting-section').classList.add('hidden');
  document.getElementById('vote-results').classList.add('hidden');
  document.getElementById('login-section').classList.remove('hidden');
  document.getElementById('sign-out').classList.add('hidden');

  // ✅ Reset vote status text
  document.getElementById("voted-candidate").innerText = "You have not voted yet.";
});

// -------------------------
// ✅ Voting Form Submission (University + College)
// -------------------------
document.getElementById('vote-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const selectedCandidate = document.querySelector('input[name="candidate"]:checked');
  const selectedCollegeBloc = document.querySelector('input[name="collegeBloc"]:checked');

  if (!selectedCandidate || !selectedCollegeBloc) {
    alert('⚠ Please select both a university bloc and a college bloc before submitting.');
    return;
  }

  const salt = ethers.utils.hexlify(ethers.utils.randomBytes(16));
  const voteDataUni = selectedCandidate.value + salt;
  const voteDataCollege = selectedCollegeBloc.value + salt;

  const voteHashUni = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(voteDataUni));
  const voteHashCollege = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(voteDataCollege));

  try {
    const selectedAccount = await signer.getAddress();
    console.log(selectedAccount) ;
    const voterInfo = await contract.voters(selectedAccount);
    const hasVotedUni = voterInfo.hasVotedUniversity;
    const hasVotedCollege = voterInfo.hasVotedCollege;

    const email = localStorage.getItem("loggedEmail");
const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));

// ✅ Submit university vote
const txUni = await contract.vote(emailHash, voteHashUni, parseInt(selectedCandidate.value), {
  from: selectedAccount,
  gasLimit: 500000
});
await txUni.wait();

// ✅ Submit college vote
const txCollege = await contract.voteCollegeBloc(
  voteHashCollege,
  parseInt(selectedCollegeBloc.dataset.blocid),
  {
    from: selectedAccount,
    gasLimit: 500000
  }
);
await txCollege.wait();


    // ✅ Update UI and localStorage
    const votedUniName = selectedCandidate.nextElementSibling.innerText;
    const votedColName = selectedCollegeBloc.nextElementSibling.innerText;

    document.getElementById("voted-candidate").innerText =
      `You voted for: University: ${votedUniName} | College: ${votedColName}`;

      const currentEmail = localStorage.getItem("loggedEmail");
      localStorage.setItem(`votedUniversityName_${currentEmail}`, votedUniName);
      localStorage.setItem(`votedCollegeName_${currentEmail}`, votedColName);


    alert("✅ Both votes cast successfully!");
    document.getElementById("vote-results").classList.remove("hidden");

    setTimeout(() => {
      getUniversityBloccount(1);
      getUniversityBloccount(2);
      getUniversityBloccount(3);
      getCollegeBloccount(1);
      getCollegeBloccount(2);
      getCollegeBloccount(3);
      getCollegeBloccount(4);
      getCollegeBloccount(5);
      fetchVotesAndDrawChart();
    }, 2000);

    await fetchVotesAndDrawChart();

  } catch (error) {
    console.error("❌ Outer Error voting:", error);
    const message = error?.message || "";

    if (
      message.includes("Already voted") ||
      message.includes("already voted") ||
      message.includes("execution reverted")
    ) {
      alert("⚠️ You have already voted. You can only vote once.");
      document.getElementById("voted-candidate").innerText = "You have already voted.";
    } else {
      alert("❌ Error voting: " + message);
    }
  }
});

async function getUniversityBloccount(candidateId) {
  try {
      // Call the contract function
      await new Promise(r => setTimeout(r, 2000));
      const result = await contract.getUniversityBloc(candidateId)
      ;
      // result[0] => candidate.id (uint8)
      // result[1] => candidate.voteCount (uint256)
      console.log(`🗳 Candidate ID: ${result[0].toString()}`);
      console.log(`📊 Vote Count: ${result[1].toString()}`);
  } catch (error) {
      console.error("❌ Error fetching candidate:", error);
  }
}

async function getCollegeBloccount(candidateId) {
  try {
      // Call the contract function
      await new Promise(r => setTimeout(r, 2000));
      const result = await contract.getCollegeBloc(candidateId)
      ;
      // result[0] => candidate.id (uint8)
      // result[1] => candidate.voteCount (uint256)
      console.log(`🗳 college ID: ${result[0].toString()}`);
      console.log(`📊 Vote Count: ${result[1].toString()}`);
  } catch (error) {
      console.error("❌ Error fetching candidate:", error);
  }
}

// ✅ Refresh Results Button
document.getElementById("refresh-results").addEventListener("click", async () => {
const college = localStorage.getItem("userCollege");
if (!college) {
  alert("⚠️ Could not determine your college.");
  return;
}

console.log("🔄 Refreshing vote charts...");
await fetchVotesAndDrawChart(college);
document.getElementById("vote-results").classList.remove("hidden");
});

let mychart ;
async function fetchVotesAndDrawChart(college) {
  try {
    const response = await fetch(`${BASE_URL}/results?college=${college}`);
    const data = await response.json();

    if (!data.success) throw new Error("Failed to load results");

    const universityData = {};
    data.university.forEach(bloc => {
      universityData[bloc.name] = bloc.count;
    });

    const collegeData = {};
    data.college.forEach(bloc => {
      collegeData[bloc.name] = bloc.count;
    });

    drawChart('universityChart', 'University Bloc Results', universityData);
    drawChart('collegeChart', `College Bloc Results (${college})`, collegeData);

  } catch (err) {
    console.error("❌ Error loading vote results:", err);
  }
}

function drawChart(canvasId, title, voteMap) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const labels = Object.keys(voteMap);
  const counts = Object.values(voteMap);
  const maxVotes = Math.max(...counts);

  const backgroundColors = counts.map((count) =>
    count === maxVotes ? 'rgba(255, 215, 0, 0.8)' : 'rgba(75, 192, 192, 0.6)'
  );

  const borderColors = counts.map((count) =>
    count === maxVotes ? 'rgba(255, 215, 0, 1)' : 'rgba(75, 192, 192, 1)'
  );

  const labelsWithHighlight = labels.map((label, index) =>
    counts[index] === maxVotes ? `🏆 ${label}` : label
);

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labelsWithHighlight,
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
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, precision: 0 }
      },
      plugins: {
        title: {
          display: true,
          text: title
        },
        legend: {
          display: false
        }
      }
    }
  });
}

let mychart1 ;

async function fetchVotesAndDrawChart1(selectedCollege = null) {
  const college = selectedCollege || localStorage.getItem("userCollege");

  try {
    const response = await fetch(`${BASE_URL}/results?college=${college}`);
    const data = await response.json();

    console.log("📥 College Results Response:", data);

    if (!data.success || !Array.isArray(data.college)) {
      throw new Error("Backend did not return valid college data");
    }

    const collegeData = {};
    data.college.forEach(bloc => {
      collegeData[bloc.name] = bloc.count;
    });

    drawChart('collegeChart', `College Bloc Results (${college})`, collegeData);

  } catch (err) {
    console.error("❌ Error loading college vote results:", err);
  }
}

    async function populateCollegeDropdown() {
      try {
        const response = await fetch(`${BASE_URL}/all-colleges`);
        const data = await response.json();
        const dropdown = document.getElementById("college-select");

        dropdown.innerHTML = ""; // Clear old options
        data.colleges.forEach(c => {
          const option = document.createElement("option");
          option.value = c;
          option.textContent = c;
          dropdown.appendChild(option);
        });

        // Set default to logged-in user's college
        const userCollege = localStorage.getItem("userCollege");
        dropdown.value = userCollege;
      } catch (err) {
        console.error("❌ Failed to populate college list:", err);
      }
    }

    document.getElementById("college-select").addEventListener("change", (e) => {
      fetchVotesAndDrawChart1(e.target.value); // Update chart with selected college
    });