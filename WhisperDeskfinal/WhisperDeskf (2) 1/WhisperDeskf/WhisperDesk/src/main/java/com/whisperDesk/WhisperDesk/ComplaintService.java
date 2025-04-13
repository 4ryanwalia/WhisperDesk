package com.whisperDesk.WhisperDesk;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    @Autowired private ComplaintRepository complaintRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private EntityManager entityManager;
    @Autowired private EmailService emailService;

    @PostConstruct
    public void init() {
        // Log table structure
        try {
            String sql = "SHOW COLUMNS FROM complaints";
            List<Object[]> columns = entityManager.createNativeQuery(sql).getResultList();
            System.out.println("=== Complaints Table Structure ===");
            for (Object[] column : columns) {
                System.out.println("Column: " + column[0] + ", Type: " + column[1]);
            }
            System.out.println("================================");
        } catch (Exception e) {
            System.err.println("Error checking table structure: " + e.getMessage());
        }
    }

    public Complaint createComplaint(ComplaintRequest request, String username) {
        System.out.println("=== Debug: Complaint Creation ===");
        System.out.println("Request isPrivate value: " + request.isPrivate());

        Employee employee = employeeRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        Department department = departmentRepository.findByName(request.getDepartmentName())
            .orElseThrow(() -> new RuntimeException("Department not found"));

        Complaint complaint = new Complaint();
        complaint.setDescription(request.getDescription());
        complaint.setDepartment(department);
        complaint.setEmployee(employee);
        complaint.setStatus("PENDING");
        complaint.setPrivate(request.isPrivate());
        System.out.println("Complaint isPrivate after setting: " + complaint.isPrivate());

        complaint.setCreatedAt(LocalDateTime.now());

        Complaint savedComplaint = complaintRepository.save(complaint);
        System.out.println("Saved complaint isPrivate: " + savedComplaint.isPrivate());
        System.out.println("================================");
        return savedComplaint;
    }

    public List<Complaint> getEmployeeComplaints(String username) {
        return complaintRepository.findByEmployeeUsername(username);
    }

    public List<ComplaintResponse> getPublicComplaints() {
        System.out.println("Fetching public complaints");
        List<Complaint> complaints = complaintRepository.findByIsPrivateFalse();
        System.out.println("Found " + complaints.size() + " public complaints");
        return complaints.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getPrivateComplaints() {
        return complaintRepository.findByIsPrivateTrue().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<Complaint> getManagerComplaints() {
        return complaintRepository.findAll();
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public void updateComplaintStatus(Long id, String status) {
        Complaint complaint = complaintRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Complaint not found"));
        
        String oldStatus = complaint.getStatus().toString();
        complaint.setStatus(status);
        complaintRepository.save(complaint);

        // Send email notification
        try {
            String subject = "Complaint Status Updated";
            String message = String.format(
                "Your complaint (ID: %d) status has been updated from %s to %s",
                complaint.getId(),
                oldStatus,
                status
            );
            emailService.sendComplaintNotification(
                complaint.getEmployee().getEmail(),
                subject,
                message
            );
        } catch (Exception e) {
            // Log the error but don't throw it - we don't want to fail the status update
            System.err.println("Failed to send email notification: " + e.getMessage());
        }
    }

    public List<ComplaintResponse> getComplaintsByUser(String username) {
        System.out.println("Fetching complaints for user: " + username);
        List<Complaint> complaints = complaintRepository.findByEmployee_Username(username);
        System.out.println("Found " + complaints.size() + " complaints for user");
        return complaints.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getAllComplaintsForManager() {
        // Managers can see all complaints, both public and private
        return complaintRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getAllComplaintsForAdmin() {
        // Admins can see all complaints, both public and private
        return complaintRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ComplaintResponse getComplaintDetailsForAdmin(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        return new ComplaintResponse(
                complaint.getId(),
                complaint.getDescription(),
                complaint.getStatus().toString(),
                complaint.getDepartment() != null ? complaint.getDepartment().getName() : "N/A",
                complaint.getEmployee() != null ? complaint.getEmployee().getUsername() : "Anonymous",
                complaint.isPrivate(),
                complaint.getCreatedAt()
        );
    }

    public void deleteComplaint(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaintRepository.delete(complaint);
    }

    private ComplaintResponse convertToResponse(Complaint complaint) {
        ComplaintResponse response = new ComplaintResponse();
        response.setId(complaint.getId());
        response.setDescription(complaint.getDescription());
        response.setDepartmentName(complaint.getDepartment().getName());
        response.setStatus(complaint.getStatus().toString());
        response.setCreatedAt(complaint.getCreatedAt());
        response.setPrivate(complaint.isPrivate());
        response.setEmployeeUsername(complaint.getEmployee().getUsername());
        System.out.println("Converting complaint " + complaint.getId() + ", isPrivate: " + complaint.isPrivate());
        return response;
    }
}
