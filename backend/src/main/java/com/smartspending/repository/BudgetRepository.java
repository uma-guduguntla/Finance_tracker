package com.smartspending.repository;

import com.smartspending.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT b FROM Budget b WHERE b.user.id = :userId")
    List<Budget> findByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.category = :category")
    Optional<Budget> findByUserIdAndCategory(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("category") String category);
}
