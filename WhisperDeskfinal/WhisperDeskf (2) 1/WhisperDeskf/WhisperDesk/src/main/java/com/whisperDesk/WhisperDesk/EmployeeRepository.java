package com.whisperDesk.WhisperDesk;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // You can add custom queries if needed later
    Optional<Employee> findByUsername(String username);
    Optional<Employee> findByEmail(String email);
    long countByRole(String role);
}
