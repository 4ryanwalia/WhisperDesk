package com.whisperDesk.WhisperDesk;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired private AdminRepository adminRepository;
    @Autowired private ManagerRepository managerRepository;
    @Autowired private EmployeeRepository employeeRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Check Admin
        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return new User(
                    admin.getUsername(),
                    admin.getPassword(),
                    Collections.singleton(new SimpleGrantedAuthority("ADMIN"))
            );
        }


        // Check Manager
        Optional<Manager> managerOpt = managerRepository.findByUsername(username);
        if (managerOpt.isPresent()) {
            Manager manager = managerOpt.get();
            return new User(manager.getUsername(), manager.getPassword(),
                    Collections.singleton(new SimpleGrantedAuthority("MANAGER")));
        }

        // Check Employee
        Optional<Employee> empOpt = employeeRepository.findByUsername(username);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            return new User(emp.getUsername(), emp.getPassword(),
                    Collections.singleton(new SimpleGrantedAuthority("EMPLOYEE")));
        }

        throw new UsernameNotFoundException("User not found: " + username);
    }
}
