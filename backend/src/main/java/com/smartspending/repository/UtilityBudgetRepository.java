package com.smartspending.repository;

import com.smartspending.entity.Utility;
import com.smartspending.entity.UtilityBudget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UtilityBudgetRepository extends JpaRepository<UtilityBudget, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT u FROM UtilityBudget u WHERE u.user.id = :userId")
    List<UtilityBudget> findByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT u FROM UtilityBudget u WHERE u.user.id = :userId AND u.utilityType = :utilityType")
    Optional<UtilityBudget> findByUserIdAndUtilityType(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("utilityType") Utility.UtilityType utilityType);
}
