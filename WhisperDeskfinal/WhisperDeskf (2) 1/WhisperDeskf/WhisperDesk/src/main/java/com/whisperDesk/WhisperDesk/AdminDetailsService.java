package com.whisperDesk.WhisperDesk;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class AdminDetailsService implements UserDetailsService {

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));

        System.out.println("Found admin: " + admin.getUsername() + " / " + admin.getPassword());

        return new User(
                admin.getUsername().trim(),
                admin.getPassword().trim(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + admin.getRole().trim()))
        );
    }
}
