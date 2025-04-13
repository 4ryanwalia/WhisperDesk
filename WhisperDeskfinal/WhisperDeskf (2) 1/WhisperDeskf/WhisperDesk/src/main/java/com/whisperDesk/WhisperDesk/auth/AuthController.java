package com.whisperDesk.WhisperDesk.auth;

import com.whisperDesk.WhisperDesk.*;
import com.whisperDesk.WhisperDesk.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private AdminRepository adminRepository;
    @Autowired private ManagerRepository managerRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private static final String ADMIN_USERNAME = "aryan12";
    private static final String ADMIN_PASSWORD = "aryan12";


    @PostMapping("/register/employee")
    public String registerEmployee(@RequestBody Employee employee) {
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        employee.setRole("EMPLOYEE");
        employeeRepository.save(employee);
        return "Employee registered successfully.";
    }
    @PostMapping("/register/manager")
    public String registerManager(@RequestBody Manager manager) {
        manager.setPassword(passwordEncoder.encode(manager.getPassword()));
        managerRepository.save(manager);
        return "Manager registered successfully.";
    }
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        String username = request.getUsername();
        String password = request.getPassword();

        // Check for admin login
        if (ADMIN_USERNAME.equals(username) && ADMIN_PASSWORD.equals(password)) {
            return new LoginResponse(jwtUtil.generateToken(username, "ADMIN"), "ADMIN");
        }

        // Check for manager login
        Optional<Manager> manager = managerRepository.findByUsername(username);
        if (manager.isPresent() && passwordEncoder.matches(password, manager.get().getPassword())) {
            return new LoginResponse(jwtUtil.generateToken(username, "MANAGER"), "MANAGER");
        }

        // Check for employee login
        Optional<Employee> employee = employeeRepository.findByUsername(username);
        if (employee.isPresent() && passwordEncoder.matches(password, employee.get().getPassword())) {
            return new LoginResponse(jwtUtil.generateToken(username, "EMPLOYEE"), "EMPLOYEE");
        }

        throw new RuntimeException("Invalid username or password");
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
