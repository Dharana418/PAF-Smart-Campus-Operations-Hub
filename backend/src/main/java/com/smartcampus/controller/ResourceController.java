package com.smartcampus.controller;

import com.smartcampus.model.Resource;
import com.smartcampus.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {
    
    @Autowired
    private ResourceService resourceService;
    
    // 1. GET all resources
    @GetMapping
    public List<Resource> getAll() {
        return resourceService.getAllResources();
    }
    
    // 2. GET by ID
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getById(@PathVariable Long id) {
        Resource resource = resourceService.getResourceById(id);
        return resource != null ? ResponseEntity.ok(resource) : ResponseEntity.notFound().build();
    }
    
    // 3. GET filter
    @GetMapping("/filter")
    public List<Resource> filter(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity) {
        return resourceService.filterResources(type, location, minCapacity);
    }
    
    // 4. POST create
    @PostMapping
    public ResponseEntity<Resource> create(@RequestBody Resource resource) {
        return new ResponseEntity<>(resourceService.createResource(resource), HttpStatus.CREATED);
    }
    
    // 5. PUT update
    @PutMapping("/{id}")
    public ResponseEntity<Resource> update(@PathVariable Long id, @RequestBody Resource resource) {
        Resource updated = resourceService.updateResource(id, resource);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
    
    // 6. DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}