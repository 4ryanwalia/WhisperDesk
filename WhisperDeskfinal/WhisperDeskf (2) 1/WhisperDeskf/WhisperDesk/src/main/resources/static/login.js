document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registerLink = document.getElementById('registerLink');
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));

    // Handle login form submission
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('username', username);
                window.location.href = '/dashboard.html';
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            alert('Invalid username or password');
        }
    });

    // Show register modal
    registerLink.addEventListener('click', (event) => {
        event.preventDefault();
        registerModal.show();
    });

    // Handle registration form submission
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const email = document.getElementById('regEmail').value;
        const name = document.getElementById('regName').value;
        const role = 'EMPLOYEE'; // Since this is the employee registration modal

        try {
            const response = await fetch('/auth/register/employee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, email, name })
            });

            if (response.ok) {
                alert('Registration successful! Please login.');
                registerModal.hide();
                registerForm.reset();
            } else {
                const errorData = await response.text();
                throw new Error(errorData || 'Registration failed');
            }
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    });
}); 