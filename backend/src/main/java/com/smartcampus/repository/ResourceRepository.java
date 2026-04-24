package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(String type);
    List<Resource> findByLocationContaining(String location);
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
}