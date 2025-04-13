package com.whisperDesk.WhisperDesk;

import jakarta.persistence.*;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String employeeCode;

    @Column(nullable = false, unique = true)
    private String username;

    private String password;  // ✅ Needed for login
    private String name;
    private String email;
    private boolean isAnonymous = true;

    private String role;  // ✅ "EMPLOYEE"

    public Employee() {}

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isAnonymous() { return isAnonymous; }
    public void setAnonymous(boolean anonymous) { this.isAnonymous = anonymous; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
