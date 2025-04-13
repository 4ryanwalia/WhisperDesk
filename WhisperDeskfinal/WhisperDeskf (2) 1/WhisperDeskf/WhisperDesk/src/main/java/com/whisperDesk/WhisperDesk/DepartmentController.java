package com.whisperDesk.WhisperDesk;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/departments")
public class DepartmentController {
    @Autowired
    private DepartmentRepository departmentRepository;
    @PostMapping("/add")
    public Department addDepartment(@RequestBody Department department) {
        return departmentRepository.save(department);
    }
    @GetMapping("/all")
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }
}
