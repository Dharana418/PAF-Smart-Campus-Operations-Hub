package com.campus.facilitiesapi.controller;

import com.campus.facilitiesapi.entity.Resource;
import com.campus.facilitiesapi.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Resource Management", description = "APIs for managing facilities and assets")
public class ResourceController {
    
    @Autowired
    private ResourceService resourceService;
    
    @Operation(summary = "Get all resources", description = "Returns a list of all resources with optional filters")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved resources")
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @Parameter(description = "Filter by resource type (LECTURE_HALL, LAB, MEETING_ROOM, PROJECTOR, CAMERA)")
            @RequestParam(required = false) String type,
            @Parameter(description = "Filter by minimum capacity")
            @RequestParam(required = false) Integer minCapacity,
            @Parameter(description = "Filter by location (partial match)")
            @RequestParam(required = false) String location) {
        List<Resource> resources = resourceService.searchResources(type, minCapacity, location);
        return ResponseEntity.ok(resources);
    }
    
    @Operation(summary = "Get resource by ID", description = "Returns a single resource by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Resource found"),
        @ApiResponse(responseCode = "404", description = "Resource not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@Parameter(description = "Resource ID") @PathVariable Long id) {
        Resource resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }
    
    @Operation(summary = "Create new resource", description = "Creates a new facility or asset")
    @ApiResponse(responseCode = "201", description = "Resource created successfully")
    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody Resource resource) {
        Resource created = resourceService.createResource(resource);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    
    @Operation(summary = "Update resource", description = "Updates an existing resource")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Resource updated successfully"),
        @ApiResponse(responseCode = "404", description = "Resource not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @Valid @RequestBody Resource resource) {
        Resource updated = resourceService.updateResource(id, resource);
        return ResponseEntity.ok(updated);
    }
    
    @Operation(summary = "Delete resource", description = "Deletes a resource by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Resource deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Resource not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "Update resource status", description = "Updates only the status of a resource")
    @PatchMapping("/{id}/status")
    public ResponseEntity<Resource> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Resource resource = resourceService.getResourceById(id);
        resource.setStatus(status);
        Resource updated = resourceService.updateResource(id, resource);
        return ResponseEntity.ok(updated);
    }
}