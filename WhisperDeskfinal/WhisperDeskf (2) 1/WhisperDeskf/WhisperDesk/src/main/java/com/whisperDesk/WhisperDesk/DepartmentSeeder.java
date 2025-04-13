package com.whisperDesk.WhisperDesk;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DepartmentSeeder implements CommandLineRunner {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public void run(String... args) throws Exception {
        if (departmentRepository.count() == 0) {
            departmentRepository.save(new Department("HR", "hr@company.com"));
            departmentRepository.save(new Department("IT", "it@company.com"));
            departmentRepository.save(new Department("Finance", "finance@company.com"));
        }
    }
}
