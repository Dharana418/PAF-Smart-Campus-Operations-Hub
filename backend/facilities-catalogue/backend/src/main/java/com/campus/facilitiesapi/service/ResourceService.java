package com.campus.facilitiesapi.service;

import com.campus.facilitiesapi.entity.Resource;
import com.campus.facilitiesapi.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ResourceService {
    
    @Autowired
    private ResourceRepository resourceRepository;
    
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }
    
    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }
    
    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }
    
    public Resource updateResource(Long id, Resource resourceDetails) {
        Resource existing = getResourceById(id);
        existing.setName(resourceDetails.getName());
        existing.setType(resourceDetails.getType());
        existing.setCapacity(resourceDetails.getCapacity());
        existing.setLocation(resourceDetails.getLocation());
        existing.setAvailableFrom(resourceDetails.getAvailableFrom());
        existing.setAvailableUntil(resourceDetails.getAvailableUntil());
        existing.setStatus(resourceDetails.getStatus());
        return resourceRepository.save(existing);
    }
    
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }
    
    public List<Resource> searchResources(String type, Integer minCapacity, String location) {
        if (type != null && minCapacity != null) {
            return resourceRepository.findByTypeAndCapacityGreaterThanEqual(type, minCapacity);
        }
        if (type != null) {
            return resourceRepository.findByType(type);
        }
        if (minCapacity != null) {
            return resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
        }
        if (location != null) {
            return resourceRepository.findByLocationContainingIgnoreCase(location);
        }
        return resourceRepository.findAll();
    }
}