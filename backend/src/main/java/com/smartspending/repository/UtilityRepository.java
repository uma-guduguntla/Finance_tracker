package com.smartspending.repository;

import com.smartspending.entity.Utility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UtilityRepository extends JpaRepository<Utility, Long> {
    List<Utility> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Utility> findByUserIdAndDueDateBetween(Long userId, LocalDate start, LocalDate end);
    Optional<Utility> findTopByUserIdAndUtilityTypeOrderByCreatedAtDesc(Long userId, Utility.UtilityType utilityType);
    List<Utility> findByUserIdAndBillDateBetween(Long userId, LocalDate start, LocalDate end);
}
