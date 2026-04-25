package com.smartcampus.model;

import javax.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "resources")
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String type;  // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    private Integer capacity;
    private String location;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private String status;  // ACTIVE, OUT_OF_SERVICE
    private String imageUrl;
    
    public Resource() {}
    
    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getType() { return type; }
    public Integer getCapacity() { return capacity; }
    public String getLocation() { return location; }
    public LocalTime getAvailableFrom() { return availableFrom; }
    public LocalTime getAvailableTo() { return availableTo; }
    public String getStatus() { return status; }
    public String getImageUrl() { return imageUrl; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setType(String type) { this.type = type; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public void setLocation(String location) { this.location = location; }
    public void setAvailableFrom(LocalTime availableFrom) { this.availableFrom = availableFrom; }
    public void setAvailableTo(LocalTime availableTo) { this.availableTo = availableTo; }
    public void setStatus(String status) { this.status = status; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}