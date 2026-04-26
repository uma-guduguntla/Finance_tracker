package com.smartspending.repository;

import com.smartspending.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;

public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {
    List<Expense> findByUserIdOrderByDateDesc(Long userId);
    
    Page<Expense> findByUserId(Long userId, Pageable pageable);
    
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId GROUP BY e.category")
    List<Object[]> findSumAmountByCategoryForUser(@Param("userId") Long userId);
    
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.date >= :startDate AND e.date <= :endDate GROUP BY e.category")
    List<Object[]> findSumAmountByCategoryForUserAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.date >= :startDate AND e.date <= :endDate")
    java.math.BigDecimal findTotalAmountForUserAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
