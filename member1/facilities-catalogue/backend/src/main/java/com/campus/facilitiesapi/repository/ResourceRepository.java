package com.campus.facilitiesapi.repository;

import com.campus.facilitiesapi.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(String type);
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
    List<Resource> findByLocationContainingIgnoreCase(String location);
    List<Resource> findByTypeAndCapacityGreaterThanEqual(String type, Integer capacity);
    List<Resource> findByStatus(String status);
}