package com.whisperDesk.WhisperDesk;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String trackingId;

    private String description;

    @Column(name = "status")
    private String status;

    @Column(name = "is_private")
    private boolean isPrivate = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Employee employee;

    public enum Status {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        REJECTED
    }

    @PrePersist
    protected void onCreate() {
        this.trackingId = "COMP-" + System.currentTimeMillis();
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Status getStatus() { return Status.valueOf(status.toUpperCase()); }
    public void setStatus(Status status) { this.status = status.toString(); }
    public void setStatus(String status) { this.status = status.toUpperCase(); }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public boolean isPrivate() {
        return isPrivate;
    }
    public void setPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }
}
