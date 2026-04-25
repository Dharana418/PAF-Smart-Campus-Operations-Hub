package com.smartcampus.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "current_occupancy")
public class CurrentOccupancy {
    @Id
    private Long resourceId;
    
    private String status;  // EMPTY, OCCUPIED, UNKNOWN
    private LocalDateTime lastUpdated;
    private String sensorId;
    
    public CurrentOccupancy() {}
    
    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    public String getSensorId() { return sensorId; }
    public void setSensorId(String sensorId) { this.sensorId = sensorId; }
}