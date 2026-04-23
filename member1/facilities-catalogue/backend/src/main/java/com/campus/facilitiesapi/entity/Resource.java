package com.campus.facilitiesapi.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "resources")
public class Resource {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
    @Column(nullable = false)
    private String name;
    
    @NotBlank(message = "Type is required")
    @Column(nullable = false)
    private String type;
    
    @NotNull(message = "Capacity is required")
    @Min(value = 0, message = "Capacity cannot be negative")
    @Max(value = 5000, message = "Capacity cannot exceed 5000")
    private Integer capacity;
    
    @NotBlank(message = "Location is required")
    @Column(nullable = false)
    private String location;
    
    private LocalTime availableFrom;
    private LocalTime availableUntil;
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "ACTIVE|OUT_OF_SERVICE", message = "Status must be ACTIVE or OUT_OF_SERVICE")
    @Column(nullable = false)
    private String status;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public Resource() {}
    
    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getType() { return type; }
    public Integer getCapacity() { return capacity; }
    public String getLocation() { return location; }
    public LocalTime getAvailableFrom() { return availableFrom; }
    public LocalTime getAvailableUntil() { return availableUntil; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setType(String type) { this.type = type; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public void setLocation(String location) { this.location = location; }
    public void setAvailableFrom(LocalTime availableFrom) { this.availableFrom = availableFrom; }
    public void setAvailableUntil(LocalTime availableUntil) { this.availableUntil = availableUntil; }
    public void setStatus(String status) { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
        if (availableFrom == null) availableFrom = LocalTime.of(8, 0);
        if (availableUntil == null) availableUntil = LocalTime.of(20, 0);
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}