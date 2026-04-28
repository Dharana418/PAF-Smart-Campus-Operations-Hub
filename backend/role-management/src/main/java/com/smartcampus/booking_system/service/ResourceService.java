package com.smartcampus.booking_system.service;

import com.smartcampus.booking_system.model.Resource;
import com.smartcampus.booking_system.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {
    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Optional<Resource> getResourceById(String id) {
        return resourceRepository.findById(id);
    }

    public Resource createResource(Resource resource) {
        resource.setCreatedAt(LocalDateTime.now());
        resource.setUpdatedAt(LocalDateTime.now());
        if (resource.getStatus() == null) resource.setStatus("ACTIVE");
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource resourceDetails) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        
        resource.setName(resourceDetails.getName());
        resource.setType(resourceDetails.getType());
        resource.setCapacity(resourceDetails.getCapacity());
        resource.setLocation(resourceDetails.getLocation());
        resource.setAvailableFrom(resourceDetails.getAvailableFrom());
        resource.setAvailableUntil(resourceDetails.getAvailableUntil());
        resource.setStatus(resourceDetails.getStatus());
        resource.setUpdatedAt(LocalDateTime.now());
        
        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        resourceRepository.deleteById(id);
    }

    public List<Resource> searchResources(String type, String location, Integer minCapacity) {
        // Simple filtering logic
        return resourceRepository.findAll().stream()
                .filter(r -> type == null || r.getType().equalsIgnoreCase(type))
                .filter(r -> location == null || r.getLocation().equalsIgnoreCase(location))
                .filter(r -> minCapacity == null || r.getCapacity() >= minCapacity)
                .toList();
    }
}
