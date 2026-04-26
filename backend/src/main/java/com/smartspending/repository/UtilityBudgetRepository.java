package com.smartspending.repository;

import com.smartspending.entity.Utility;
import com.smartspending.entity.UtilityBudget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UtilityBudgetRepository extends JpaRepository<UtilityBudget, Long> {
    List<UtilityBudget> findByUserId(Long userId);
    Optional<UtilityBudget> findByUserIdAndUtilityType(Long userId, Utility.UtilityType utilityType);
}
