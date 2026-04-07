package com.smartspending.repository;

import com.smartspending.entity.LeakExplanation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeakExplanationRepository extends JpaRepository<LeakExplanation, Long> {
    List<LeakExplanation> findByUserIdOrderByDetectedAtDesc(Long userId);
    void deleteByUserId(Long userId);
}
