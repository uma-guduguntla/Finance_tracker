package com.smartspending.repository;

import com.smartspending.entity.MoneyLeak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MoneyLeakRepository extends JpaRepository<MoneyLeak, Long> {
    List<MoneyLeak> findByUserIdOrderByDetectedAtDesc(Long userId);
    
    @Modifying
    @Query("DELETE FROM MoneyLeak m WHERE m.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
