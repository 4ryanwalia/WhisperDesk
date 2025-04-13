package com.whisperDesk.WhisperDesk;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ManagerRepository managerRepository;

    @GetMapping
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    @PostMapping
    public Admin createAdmin(@RequestBody Admin admin) {
        return adminRepository.save(admin);
    }

    @PutMapping("/{id}")
    public Admin updateAdmin(@PathVariable Long id, @RequestBody Admin updatedAdmin) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        admin.setUsername(updatedAdmin.getUsername());
        admin.setPassword(updatedAdmin.getPassword());
        admin.setRole(updatedAdmin.getRole());
        return adminRepository.save(admin);
    }
    @DeleteMapping("/{id}")
    public void deleteAdmin(@PathVariable Long id) {
        adminRepository.deleteById(id);
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<EmployeeResponse> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        return employees.stream()
                .map(employee -> new EmployeeResponse(
                        employee.getUsername(),
                        employee.getRole()
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/employees/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public Employee getEmployeeById(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    @GetMapping("/complaints")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    @GetMapping("/complaints/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public Complaint getComplaintById(@PathVariable Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
    }

    @DeleteMapping("/users/{username}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable String username) {
        try {
            Employee employee = employeeRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Prevent deleting the last admin
            if ("ADMIN".equals(employee.getRole())) {
                long adminCount = employeeRepository.countByRole("ADMIN");
                if (adminCount <= 1) {
                    return ResponseEntity.badRequest().body("Cannot delete the last admin user");
                }
            }
            
            employeeRepository.delete(employee);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting user: " + e.getMessage());
        }
    }

    @PostMapping("/managers")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> createManager(@RequestBody ManagerRequest request) {
        try {
            // Validate input
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Name is required");
            }
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Username is required");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }

            // Check if username already exists
            if (managerRepository.findByUsername(request.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body("Username already exists");
            }

            // Check if email already exists
            if (managerRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Email already exists");
            }

            // Create new manager
            Manager manager = new Manager();
            manager.setName(request.getName().trim());
            manager.setEmail(request.getEmail().trim());
            manager.setUsername(request.getUsername().trim());
            manager.setPassword(passwordEncoder.encode(request.getPassword()));

            managerRepository.save(manager);
            return ResponseEntity.ok("Manager created successfully");
        } catch (Exception e) {
            System.err.println("Error creating manager: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating manager: " + e.getMessage());
        }
    }

    @GetMapping("/managers")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Manager>> getAllManagers() {
        try {
            List<Manager> managers = managerRepository.findAll();
            return ResponseEntity.ok(managers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/managers/{username}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteManager(@PathVariable String username) {
        try {
            Optional<Manager> manager = managerRepository.findByUsername(username);
            if (manager.isPresent()) {
                managerRepository.delete(manager.get());
                return ResponseEntity.ok("Manager deleted successfully");
            } else {
                return ResponseEntity.badRequest().body("Manager not found");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting manager: " + e.getMessage());
        }
    }
}

