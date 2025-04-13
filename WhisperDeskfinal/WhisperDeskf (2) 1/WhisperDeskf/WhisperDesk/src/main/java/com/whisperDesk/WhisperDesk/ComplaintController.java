package com.whisperDesk.WhisperDesk;

import com.whisperDesk.WhisperDesk.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<?> createComplaint(@RequestBody ComplaintRequest request, 
                                           @RequestHeader("Authorization") String token) {
        String username = jwtUtil.extractUsername(token.substring(7));
        Complaint complaint = complaintService.createComplaint(request, username);
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(@RequestHeader("Authorization") String token) {
        String username = jwtUtil.extractUsername(token.substring(7));
        return ResponseEntity.ok(complaintService.getComplaintsByUser(username));
    }

    @GetMapping("/public")
    public ResponseEntity<List<ComplaintResponse>> getPublicComplaints() {
        return ResponseEntity.ok(complaintService.getPublicComplaints());
    }

    @GetMapping("/manager/all")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaintsForManager() {
        return ResponseEntity.ok(complaintService.getAllComplaintsForManager());
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaintsForAdmin() {
        return ResponseEntity.ok(complaintService.getAllComplaintsForAdmin());
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ComplaintResponse getComplaintDetailsForAdmin(@PathVariable Long id) {
        return complaintService.getComplaintDetailsForAdmin(id);
    }

    @PutMapping("/status")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
    public ResponseEntity<?> updateComplaintStatus(@RequestParam Long id, @RequestParam String status) {
        complaintService.updateComplaintStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/test-email")
    public ResponseEntity<String> testEmail() {
        try {
            emailService.sendComplaintNotification(
                "recipient-email@example.com",  // Replace with your test email
                "Test Email from WhisperDesk",
                "This is a test email to verify the email service is working correctly."
            );
            return ResponseEntity.ok("Test email sent successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send test email: " + e.getMessage());
        }
    }
}