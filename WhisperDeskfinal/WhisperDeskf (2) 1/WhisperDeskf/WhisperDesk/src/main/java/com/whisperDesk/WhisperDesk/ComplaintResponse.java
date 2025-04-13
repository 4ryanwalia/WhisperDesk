package com.whisperDesk.WhisperDesk;

import java.time.LocalDateTime;

public class ComplaintResponse {
    private Long id;
    private String description;
    private String departmentName;
    private String status;
    private String employeeUsername;
    private boolean isPrivate;
    private LocalDateTime createdAt;

    public ComplaintResponse() {}

    public ComplaintResponse(Long id, String description, String status, String departmentName, 
                           String employeeUsername, boolean isPrivate, LocalDateTime createdAt) {
        this.id = id;
        this.description = description;
        this.status = status;
        this.departmentName = departmentName;
        this.employeeUsername = employeeUsername;
        this.isPrivate = isPrivate;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEmployeeUsername() { return employeeUsername; }
    public void setEmployeeUsername(String employeeUsername) { this.employeeUsername = employeeUsername; }

    public boolean isPrivate() { return isPrivate; }
    public void setPrivate(boolean isPrivate) { this.isPrivate = isPrivate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
