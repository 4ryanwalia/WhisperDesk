// === GLOBAL ===
let currentFilterStatus = "Pending";


// === MANAGER DASHBOARD TABS ===
function loadNewRequests() {
  currentFilterStatus = "Pending";
  loadComplaintsByStatus("Pending", "New Complaint Requests");
}

function loadInProgress() {
  currentFilterStatus = "In Progress";
  loadComplaintsByStatus("In Progress", "In Progress Complaints");
}

function loadCompleted() {
  currentFilterStatus = "Completed";
  loadComplaintsByStatus("Completed", "Completed Complaints");
}

function loadComplaintsByStatus(status, title) {
  const token = localStorage.getItem("token");
  fetch("http://localhost:9097/api/complaints/public", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const filtered = data.filter(c => c.status?.toLowerCase().trim() === status.toLowerCase().trim());
      renderComplaints(filtered, title, true); // showActions = true for managers
    })
    .catch(err => {
      console.error("❌ Failed to load complaints by status:", err);
      alert("❌ Could not load complaints.");
    });
}

// === LOGIN ===
function loginUser(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:9097/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", username);

        if (data.role === "EMPLOYEE") {
          window.location.href = "employee-dashboard.html";
        } else if (data.role === "MANAGER") {
          window.location.href = "manager-dashboard.html";
        } else if (data.role === "ADMIN") {
          window.location.href = "admin-dashboard.html";
        } else {
          alert("Unsupported role");
        }
      } else {
        alert("Invalid login");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Login failed");
    });
}

// === REGISTER ===
function registerUser(event) {
  event.preventDefault();
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  const role = document.getElementById("reg-role").value;

  const endpoint = role === "EMPLOYEE" ? "register/employee" : "register/manager";

  fetch(`http://localhost:9097/auth/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password, role })
  })
    .then(res => res.text())
    .then(message => {
      alert(message);
      window.location.href = "login.html";
    })
    .catch(err => {
      console.error(err);
      alert("Registration failed");
    });
}

// Only block access on admin-dashboard.html
if (window.location.pathname.includes("admin-dashboard.html")) {
  const role = localStorage.getItem("role");
  if (role !== "ADMIN") {
    alert("Access denied. Admins only.");
    window.location.href = "login.html";
  }
}


// === COMPLAINT SUBMISSION ===
function loadComplaintForm() {
  document.getElementById("content").innerHTML = `
    <h3>File a Complaint</h3>
    <textarea id="complaintText" rows="4" placeholder="Enter your complaint"></textarea><br><br>
    <label>Department:</label>
    <input type="text" id="dept" placeholder="Enter your department"><br><br>
    <div class="form-check">
      <input type="checkbox" class="form-check-input" id="isPrivate">
      <label class="form-check-label" for="isPrivate">Private Complaint (Only visible to admins and managers)</label>
    </div><br>
    <button onclick="submitComplaint()">Submit</button>
  `;
}

function submitComplaint() {
  const complaintText = document.getElementById("complaintText").value;
  const department = document.getElementById("dept").value;
  const isPrivate = document.getElementById("isPrivate").checked;
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You must be logged in to submit a complaint.");
    return;
  }

  const validDepartments = ["HR", "IT", "Finance"];
  if (!validDepartments.includes(department)) {
    alert("Invalid department selected!");
    return;
  }

  fetch("http://localhost:9097/api/complaints", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      description: complaintText,
      departmentName: department,
      isPrivate: isPrivate
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Submission failed");
      return res.text();
    })
    .then(msg => {
      alert("✅ " + msg);
      document.getElementById("complaintText").value = "";
      document.getElementById("isPrivate").checked = false;
      loadMyComplaints();
    })
    .catch(err => {
      console.error("❌", err);
      alert("❌ Submission failed");
    });
}

// === EMPLOYEE DASHBOARD ===
function loadMyComplaints() {
  const token = localStorage.getItem("token");
  fetch("http://localhost:9097/api/complaints/my", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log("My complaints:", data);
      renderComplaints(data, "My Complaints");
    })
    .catch(err => {
      console.error("❌ Failed to load my complaints:", err);
      alert("❌ Could not load my complaints.");
    });
}

function loadAllComplaints() {
  const token = localStorage.getItem("token");
  fetch("http://localhost:9097/api/complaints/public", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => renderComplaints(data, "All Complaints"))
    .catch(err => {
      console.error("❌ Failed to load all complaints:", err);
      alert("❌ Could not load all complaints.");
    });
}

function loadRejectedComplaints() {
  const token = localStorage.getItem("token");
  fetch("http://localhost:9097/api/complaints/my", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const rejected = data.filter(c => c.status?.toLowerCase().trim() === 'rejected');
      renderComplaints(rejected, "Rejected Complaints");
    })
    .catch(err => {
      console.error("❌ Failed to load rejected complaints:", err);
      alert("❌ Could not load rejected complaints.");
    });
}

function loadCompletedComplaints() {
  const token = localStorage.getItem("token");
  fetch("http://localhost:9097/api/complaints/my", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const completed = data.filter(c => c.status?.toLowerCase().trim() === 'completed');
      renderComplaints(completed, "Completed Complaints");
    })
    .catch(err => {
      console.error("❌ Failed to load completed complaints:", err);
      alert("❌ Could not load completed complaints.");
    });
}
function loadInProgressComplaints() {
  const token = localStorage.getItem("token");
  fetch("http://localhost:9097/api/complaints/my", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const inProgress = data.filter(c => c.status?.toLowerCase().trim() === 'in progress');
      renderComplaints(inProgress, "In Progress Complaints");
    })
    .catch(err => {
      console.error("❌ Failed to load in-progress complaints:", err);
      alert("❌ Could not load in-progress complaints.");
    });
}
// === DEPARTMENT FILTER (Manager) ===
function filterComplaintsByDepartment() {
  const token = localStorage.getItem("token");
  const selectedDept = document.getElementById("departmentFilter").value;

  fetch("http://localhost:9097/api/complaints/public", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      let filtered = data;
      if (selectedDept !== "All") {
        filtered = filtered.filter(c => c.departmentName?.toLowerCase() === selectedDept.toLowerCase());
      }
      if (currentFilterStatus) {
        filtered = filtered.filter(c => c.status?.toLowerCase().trim() === currentFilterStatus.toLowerCase());
      }
      renderComplaints(filtered, `Complaints - ${selectedDept} - ${currentFilterStatus}`, true);
    })
    .catch(err => {
      console.error("❌ Error filtering complaints:", err);
      alert("❌ Could not filter complaints.");
    });
}
// === COMPLAINT RENDERER (Supports Manager Buttons) ===
function renderComplaints(complaints, title, showActions = false) {
  let html = `<h3>${title}</h3>`;
  if (complaints.length === 0) {
    html += "<p>No complaints found.</p>";
  } else {
    html += "<table><tr><th>Description</th><th>Department</th><th>Status</th>";
    if (showActions) html += "<th>Actions</th>";
    html += "</tr>";

    complaints.forEach(c => {
      html += `
        <tr>
          <td>${c.description}</td>
          <td>${c.departmentName || "N/A"}</td>
          <td>${c.status}</td>`;
      if (showActions) {
        html += `
          <td>
            <button onclick="updateComplaintStatus(${c.id}, 'In Progress')">In Progress</button>
            <button onclick="updateComplaintStatus(${c.id}, 'Completed')">Completed</button>
            <button onclick="updateComplaintStatus(${c.id}, 'Rejected')">Rejected</button>
          </td>`;
      }
      html += "</tr>";
    });

    html += "</table>";
  }
  document.getElementById("content").innerHTML = html;
}
// === STATUS UPDATER (Manager) ===
function updateComplaintStatus(id, status) {
  const token = localStorage.getItem("token");
  fetch(`http://localhost:9097/api/complaints/status?id=${id}&status=${status}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.text())
    .then(msg => {
      alert("✅ " + msg);
      loadComplaintsByStatus(currentFilterStatus, `Complaints - ${currentFilterStatus}`);
    })
    .catch(err => {
      console.error("❌ Error updating status:", err);
      alert("❌ Failed to update status.");
    });
}