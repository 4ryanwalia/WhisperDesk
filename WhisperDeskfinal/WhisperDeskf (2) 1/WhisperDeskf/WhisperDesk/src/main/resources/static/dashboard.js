let currentUser = null;
let currentToken = null;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    if (!token || !role || !username) {
        window.location.href = '/login.html';
        return;
    }

    currentUser = { username, role };
    currentToken = token;

    // Show user role in navbar
    document.getElementById('userRole').textContent = `${username} (${role.toLowerCase()})`;

    // Hide all sections first
    document.getElementById('employeeSection').style.display = 'none';
    document.getElementById('managerSection').style.display = 'none';
    document.getElementById('adminContent').style.display = 'none';
    document.getElementById('adminNavItem').style.display = 'none';

    // Show appropriate section based on role
    switch (role) {
        case 'EMPLOYEE':
            document.getElementById('employeeSection').style.display = 'block';
            loadEmployeeComplaints();
            break;
        case 'MANAGER':
            document.getElementById('managerSection').style.display = 'block';
            loadManagerComplaints();
            break;
        case 'ADMIN':
            document.getElementById('adminContent').style.display = 'block';
            document.getElementById('adminNavItem').style.display = 'block';
            document.getElementById('adminManagersNavItem').style.display = 'block';
            loadAdminComplaints();
            loadEmployees();
            break;
    }

    // Add event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('complaintForm')?.addEventListener('submit', submitComplaint);
    document.getElementById('statusForm')?.addEventListener('submit', updateStatus);
    document.getElementById('managerForm')?.addEventListener('submit', createManager);

    // Add navigation event listeners
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.dataset.section;
            showSection(section);
        });
    });
});

// Show specific section
function showSection(section) {
    // Hide all sections
    document.getElementById('employeeSection').style.display = 'none';
    document.getElementById('managerSection').style.display = 'none';
    document.getElementById('adminContent').style.display = 'none';
    document.getElementById('managersSection').style.display = 'none';
    document.getElementById('employeesSection').style.display = 'none';

    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section and set active nav link
    switch (section) {
        case 'complaints':
            if (currentUser.role === 'EMPLOYEE') {
                document.getElementById('employeeSection').style.display = 'block';
                loadEmployeeComplaints();
            } else if (currentUser.role === 'MANAGER') {
                document.getElementById('managerSection').style.display = 'block';
                loadManagerComplaints();
            } else if (currentUser.role === 'ADMIN') {
                document.getElementById('adminContent').style.display = 'block';
                loadAdminComplaints();
            }
            document.querySelector('a[data-section="complaints"]').classList.add('active');
            break;
        case 'employees':
            if (currentUser.role === 'ADMIN') {
                document.getElementById('employeesSection').style.display = 'block';
                loadEmployees();
            }
            document.querySelector('a[data-section="employees"]').classList.add('active');
            break;
        case 'managers':
            if (currentUser.role === 'ADMIN') {
                document.getElementById('managersSection').style.display = 'block';
                loadManagers();
            }
            document.querySelector('a[data-section="managers"]').classList.add('active');
            break;
    }
}

// Helper function to format date and time
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
}

// Load employee's own complaints
async function loadEmployeeComplaints() {
    try {
        const response = await fetch('/api/complaints/my', {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load complaints');
        }

        const data = await response.json();
        console.log('Loaded employee complaints:', data);
        
        const tbody = document.querySelector('#employeeComplaintsTable tbody');
        tbody.innerHTML = '';

        if (data && Array.isArray(data)) {
            data.forEach(complaint => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${complaint.id}</td>
                    <td>${complaint.description}</td>
                    <td>${complaint.departmentName}</td>
                    <td><span class="badge bg-${getStatusColor(complaint.status)}">${formatStatus(complaint.status)}</span></td>
                    <td>${formatDateTime(complaint.createdAt)}</td>
                    <td>
                        <span class="badge bg-${complaint.private ? 'warning' : 'success'}">
                            ${complaint.private ? 'Private' : 'Public'}
                        </span>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        // After loading employee complaints, load public complaints
        await loadAllComplaintsForEmployee();
    } catch (error) {
        console.error('Error loading complaints:', error);
        showAlert('Error loading complaints: ' + error.message, 'danger');
    }
}

// Load all complaints for employee view (only public ones)
async function loadAllComplaintsForEmployee() {
    try {
        const response = await fetch('/api/complaints/public', {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load complaints');
        }

        const data = await response.json();
        const tbody = document.querySelector('#allComplaintsTable tbody');
        tbody.innerHTML = '';

        if (data && Array.isArray(data)) {
            data.forEach(complaint => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${complaint.id}</td>
                    <td>${complaint.description}</td>
                    <td>${complaint.departmentName}</td>
                    <td><span class="badge bg-${getStatusColor(complaint.status)}">${formatStatus(complaint.status)}</span></td>
                    <td>${formatDateTime(complaint.createdAt)}</td>
                    <td>
                        <span class="badge bg-success">Public</span>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading all complaints:', error);
        showAlert('Error loading all complaints: ' + error.message, 'danger');
    }
}

// Load all complaints for manager (including private ones)
async function loadManagerComplaints() {
    try {
        const response = await fetch('/api/complaints/manager/all', {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load complaints');
        }

        const data = await response.json();
        // Store the complaints data for filtering
        window.managerComplaintsData = data;
        filterManagerComplaints();
    } catch (error) {
        console.error('Error loading complaints:', error);
        showAlert('Error loading complaints: ' + error.message, 'danger');
    }
}

// Filter manager complaints by department and status
function filterManagerComplaints() {
    const selectedDepartment = document.getElementById('managerDepartmentFilter').value;
    const selectedStatus = document.getElementById('managerStatusFilter').value;
    const tbody = document.querySelector('#managerComplaintsTable tbody');
    tbody.innerHTML = '';

    if (!window.managerComplaintsData) return;

    let filteredComplaints = window.managerComplaintsData;

    // Apply department filter
    if (selectedDepartment !== 'All') {
        filteredComplaints = filteredComplaints.filter(complaint => 
            complaint.departmentName === selectedDepartment
        );
    }

    // Apply status filter
    if (selectedStatus !== 'All') {
        filteredComplaints = filteredComplaints.filter(complaint => 
            complaint.status === selectedStatus
        );
    }

    if (filteredComplaints && Array.isArray(filteredComplaints)) {
        filteredComplaints.forEach(complaint => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${complaint.id}</td>
                <td>${complaint.description}</td>
                <td>${complaint.departmentName}</td>
                <td><span class="badge bg-${getStatusColor(complaint.status)}">${formatStatus(complaint.status)}</span></td>
                <td>${formatDateTime(complaint.createdAt)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="showStatusModal(${complaint.id})">
                        <i class="bi bi-pencil"></i> Update
                    </button>
                </td>
                <td>
                    <span class="badge bg-${complaint.private ? 'warning' : 'success'}">
                        ${complaint.private ? 'Private' : 'Public'}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Load all complaints for admin (including private ones)
async function loadAdminComplaints() {
    try {
        const response = await fetch('/api/complaints/admin/all', {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load complaints');
        }

        const data = await response.json();
        // Store the complaints data for filtering
        window.adminComplaintsData = data;
        filterAdminComplaints();
    } catch (error) {
        console.error('Error loading complaints:', error);
        showAlert('Error loading complaints: ' + error.message, 'danger');
    }
}

// Filter admin complaints by department and status
function filterAdminComplaints() {
    const selectedDepartment = document.getElementById('adminDepartmentFilter').value;
    const selectedStatus = document.getElementById('adminStatusFilter').value;
    const tbody = document.querySelector('#adminComplaintsTable tbody');
    tbody.innerHTML = '';

    if (!window.adminComplaintsData) return;

    let filteredComplaints = window.adminComplaintsData;

    // Apply department filter
    if (selectedDepartment !== 'All') {
        filteredComplaints = filteredComplaints.filter(complaint => 
            complaint.departmentName === selectedDepartment
        );
    }

    // Apply status filter
    if (selectedStatus !== 'All') {
        filteredComplaints = filteredComplaints.filter(complaint => 
            complaint.status === selectedStatus
        );
    }

    if (filteredComplaints && Array.isArray(filteredComplaints)) {
        filteredComplaints.forEach(complaint => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${complaint.id}</td>
                <td>${complaint.description}</td>
                <td>${complaint.departmentName}</td>
                <td>${complaint.employeeUsername}</td>
                <td><span class="badge bg-${getStatusColor(complaint.status)}">${formatStatus(complaint.status)}</span></td>
                <td>${formatDateTime(complaint.createdAt)}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="showStatusModal(${complaint.id})">
                        <i class="bi bi-pencil"></i> Update
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteComplaint(${complaint.id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
                <td>
                    <span class="badge bg-${complaint.private ? 'warning' : 'success'}">
                        ${complaint.private ? 'Private' : 'Public'}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Load all employees
async function loadEmployees() {
    try {
        const response = await fetch('/api/admin/employees', {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load employees');
        }

        const employees = await response.json();
        const employeesTable = document.getElementById('employeesTable');
        const tbody = employeesTable.querySelector('tbody');
        tbody.innerHTML = '';

        employees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.username}</td>
                <td>${employee.role}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${employee.username}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading employees:', error);
        showAlert('Error loading employees: ' + error.message, 'danger');
    }
}

// Submit new complaint
async function submitComplaint(isPrivate) {
    const department = document.getElementById('department').value.trim();
    const description = document.getElementById('description').value.trim();
    
    if (!department || !description) {
        showAlert('Please fill in all required fields', 'danger');
        return;
    }

    const complaintData = {
        departmentName: department,
        description: description,
        private: isPrivate
    };

    try {
        const response = await fetch('/api/complaints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(complaintData)
        });

        if (response.ok) {
            showAlert(`${isPrivate ? 'Private' : 'Public'} complaint submitted successfully`, 'success');
            document.getElementById('complaintForm').reset();
            
            // Always reload employee's own complaints
            await loadEmployeeComplaints();
            
            // Only reload all complaints table if the complaint is public
            if (!isPrivate) {
                await loadAllComplaintsForEmployee();
            }
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to submit complaint');
        }
    } catch (error) {
        console.error('Error submitting complaint:', error);
        showAlert('Error submitting complaint: ' + error.message, 'danger');
    }
}

// Show status update modal
function showStatusModal(complaintId) {
    document.getElementById('complaintId').value = complaintId;
    new bootstrap.Modal(document.getElementById('statusModal')).show();
}

// Update complaint status
async function updateStatus(event) {
    event.preventDefault();
    const complaintId = document.getElementById('complaintId').value;
    const status = document.getElementById('status').value;

    try {
        const response = await fetch(`/api/complaints/status?id=${complaintId}&status=${status}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            showAlert('Status updated successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('statusModal')).hide();
            loadAdminComplaints();
        } else {
            throw new Error('Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showAlert('Error updating status', 'danger');
    }
}

// Helper function to get status color
function getStatusColor(status) {
    switch (status.toUpperCase()) {
        case 'PENDING':
            return 'warning';
        case 'IN_PROGRESS':
            return 'info';
        case 'COMPLETED':
            return 'success';
        case 'REJECTED':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Helper function to format status text
function formatStatus(status) {
    return status.toLowerCase().split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
}

// Delete an employee
async function deleteEmployee(username) {
    if (!confirm(`Are you sure you want to delete employee ${username}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${username}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            showAlert('Employee deleted successfully', 'success');
            loadEmployees();
        } else {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        showAlert('Error deleting employee: ' + error.message, 'danger');
    }
}

// Load all managers
async function loadManagers() {
    try {
        const response = await fetch('/api/admin/managers', {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load managers');
        }

        const managers = await response.json();
        const managersTable = document.getElementById('managersTable');
        const tbody = managersTable.querySelector('tbody');
        tbody.innerHTML = '';

        managers.forEach(manager => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${manager.name}</td>
                <td>${manager.email}</td>
                <td>${manager.username}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteManager('${manager.username}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading managers:', error);
        showAlert('Error loading managers: ' + error.message, 'danger');
    }
}

// Delete a manager
async function deleteManager(username) {
    if (!confirm(`Are you sure you want to delete manager ${username}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/managers/${username}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            showAlert('Manager deleted successfully', 'success');
            loadManagers();
        } else {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error deleting manager:', error);
        showAlert('Error deleting manager: ' + error.message, 'danger');
    }
}

// Create new manager
async function createManager(event) {
    event.preventDefault();
    
    const managerData = {
        name: document.getElementById('managerName').value,
        email: document.getElementById('managerEmail').value,
        username: document.getElementById('managerUsername').value,
        password: document.getElementById('managerPassword').value
    };

    try {
        const response = await fetch('/api/admin/managers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(managerData)
        });

        if (response.ok) {
            showAlert('Manager created successfully', 'success');
            document.getElementById('managerForm').reset();
            loadManagers();
        } else {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error creating manager:', error);
        showAlert('Error creating manager: ' + error.message, 'danger');
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    // ... existing event listeners ...

    // Add manager form submit handler
    const managerForm = document.getElementById('managerForm');
    if (managerForm) {
        managerForm.addEventListener('submit', createManager);
    }

    // Add manager tab click handler
    const managerTab = document.querySelector('a[data-section="managers"]');
    if (managerTab) {
        managerTab.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('managers');
            loadManagers();
        });
    }

    // Add employee tab click handler
    const employeeTab = document.querySelector('a[data-section="employees"]');
    if (employeeTab) {
        employeeTab.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('employees');
            loadEmployees();
        });
    }
});

async function deleteComplaint(id) {
    if (!confirm('Are you sure you want to delete this complaint?')) {
        return;
    }

    try {
        const response = await fetch(`/api/complaints/admin/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            showAlert('Complaint deleted successfully', 'success');
            await loadAdminComplaints(); // Reload the complaints table
        } else {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error deleting complaint:', error);
        showAlert('Error deleting complaint: ' + error.message, 'danger');
    }
} 