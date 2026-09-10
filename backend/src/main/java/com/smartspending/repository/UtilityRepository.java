package com.smartspending.repository;

import com.smartspending.entity.Utility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UtilityRepository extends JpaRepository<Utility, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT u FROM Utility u WHERE u.user.id = :userId ORDER BY u.createdAt DESC")
    List<Utility> findByUserIdOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("userId") Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT u FROM Utility u WHERE u.user.id = :userId AND u.dueDate BETWEEN :start AND :end")
    List<Utility> findByUserIdAndDueDateBetween(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("start") LocalDate start, @org.springframework.data.repository.query.Param("end") LocalDate end);
    
    @org.springframework.data.jpa.repository.Query("SELECT u FROM Utility u WHERE u.user.id = :userId AND u.utilityType = :utilityType ORDER BY u.createdAt DESC LIMIT 1")
    Optional<Utility> findTopByUserIdAndUtilityTypeOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("utilityType") Utility.UtilityType utilityType);
    
    @org.springframework.data.jpa.repository.Query("SELECT u FROM Utility u WHERE u.user.id = :userId AND u.billDate BETWEEN :start AND :end")
    List<Utility> findByUserIdAndBillDateBetween(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("start") LocalDate start, @org.springframework.data.repository.query.Param("end") LocalDate end);
}
