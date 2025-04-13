package com.whisperDesk.WhisperDesk;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByEmployee_Username(String username);
    List<Complaint> findByEmployeeUsername(String username);
    
    @Query("SELECT c FROM Complaint c WHERE c.isPrivate = true")
    List<Complaint> findByIsPrivateTrue();
    
    @Query("SELECT c FROM Complaint c WHERE c.isPrivate = false")
    List<Complaint> findByIsPrivateFalse();
}
