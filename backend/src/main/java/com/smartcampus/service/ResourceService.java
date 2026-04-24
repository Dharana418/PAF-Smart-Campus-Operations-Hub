package com.smartcampus.service;

import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {
    
    @Autowired
    private ResourceRepository resourceRepository;
    
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }
    
    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id).orElse(null);
    }
    
    public List<Resource> filterResources(String type, String location, Integer minCapacity) {
        List<Resource> resources = resourceRepository.findAll();
        
        if (type != null && !type.isEmpty()) {
            resources = resources.stream()
                    .filter(r -> r.getType().equalsIgnoreCase(type))
                    .collect(Collectors.toList());
        }
        
        if (location != null && !location.isEmpty()) {
            resources = resources.stream()
                    .filter(r -> r.getLocation().toLowerCase().contains(location.toLowerCase()))
                    .collect(Collectors.toList());
        }
        
        if (minCapacity != null) {
            resources = resources.stream()
                    .filter(r -> r.getCapacity() >= minCapacity)
                    .collect(Collectors.toList());
        }
        
        return resources;
    }
    
    public Resource createResource(Resource resource) {
        resource.setStatus("ACTIVE");
        return resourceRepository.save(resource);
    }
    
    public Resource updateResource(Long id, Resource resourceDetails) {
        Resource resource = getResourceById(id);
        if (resource != null) {
            resource.setName(resourceDetails.getName());
            resource.setType(resourceDetails.getType());
            resource.setCapacity(resourceDetails.getCapacity());
            resource.setLocation(resourceDetails.getLocation());
            resource.setAvailableFrom(resourceDetails.getAvailableFrom());
            resource.setAvailableTo(resourceDetails.getAvailableTo());
            resource.setStatus(resourceDetails.getStatus());
            resource.setImageUrl(resourceDetails.getImageUrl());
            return resourceRepository.save(resource);
        }
        return null;
    }
    
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }
}