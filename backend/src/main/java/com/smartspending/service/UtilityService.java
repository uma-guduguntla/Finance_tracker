package com.smartspending.service;

import com.smartspending.entity.Utility;
import com.smartspending.entity.Utility.UtilityType;
import com.smartspending.entity.UtilityBudget;
import com.smartspending.entity.User;
import com.smartspending.repository.UtilityRepository;
import com.smartspending.repository.UtilityBudgetRepository;
import com.smartspending.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class UtilityService {

    @Autowired
    private UtilityRepository utilityRepository;

    @Autowired
    private UtilityBudgetRepository utilityBudgetRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Utility> getAllUtilities(Long userId) {
        return utilityRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Utility addUtility(Long userId, Utility utility) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        utility.setUser(user);
        return utilityRepository.save(utility);
    }

    public Utility updateUtility(Long id, Long userId, Utility updated) {
        Utility existing = utilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utility not found"));
        if (!existing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        existing.setUtilityType(updated.getUtilityType());
        existing.setAmount(updated.getAmount());
        existing.setBillDate(updated.getBillDate());
        existing.setDueDate(updated.getDueDate());
        existing.setIsPaid(updated.getIsPaid());
        existing.setNotes(updated.getNotes());
        return utilityRepository.save(existing);
    }

    public void deleteUtility(Long id, Long userId) {
        Utility existing = utilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utility not found"));
        if (!existing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        utilityRepository.delete(existing);
    }

    public Utility markAsPaid(Long id, Long userId) {
        Utility existing = utilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utility not found"));
        if (!existing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        existing.setIsPaid(true);
        return utilityRepository.save(existing);
    }

    public List<Utility> getUpcomingDue(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysLater = today.plusDays(7);
        return utilityRepository.findByUserIdAndDueDateBetween(userId, today, sevenDaysLater);
    }

    public Map<String, Object> getMonthlySummary(Long userId) {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);

        List<Utility> monthlyUtils = utilityRepository.findByUserIdAndBillDateBetween(userId, startOfMonth, endOfMonth);

        BigDecimal totalMonthly = BigDecimal.ZERO;
        long paidCount = 0;
        long unpaidCount = 0;
        Map<String, Map<String, Object>> byType = new LinkedHashMap<>();

        for (UtilityType type : UtilityType.values()) {
            byType.put(type.name(), null);
        }

        for (Utility u : monthlyUtils) {
            BigDecimal amount = u.getAmount() != null ? u.getAmount() : BigDecimal.ZERO;
            totalMonthly = totalMonthly.add(amount);
            if (Boolean.TRUE.equals(u.getIsPaid())) {
                paidCount++;
            } else {
                unpaidCount++;
            }
            Map<String, Object> typeData = new HashMap<>();
            typeData.put("amount", amount);
            typeData.put("isPaid", u.getIsPaid());
            typeData.put("dueDate", u.getDueDate());
            typeData.put("id", u.getId());
            byType.put(u.getUtilityType().name(), typeData);
        }

        List<Utility> upcoming = getUpcomingDue(userId);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalMonthly", totalMonthly);
        summary.put("paidCount", paidCount);
        summary.put("unpaidCount", unpaidCount);
        summary.put("upcomingDue", upcoming);
        summary.put("byType", byType);
        return summary;
    }

    public UtilityBudget setUtilityBudget(Long userId, UtilityType utilityType, BigDecimal monthlyLimit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UtilityBudget budget = utilityBudgetRepository
                .findByUserIdAndUtilityType(userId, utilityType)
                .orElse(new UtilityBudget());
        budget.setUser(user);
        budget.setUtilityType(utilityType);
        budget.setMonthlyLimit(monthlyLimit);
        return utilityBudgetRepository.save(budget);
    }

    public List<UtilityBudget> getUtilityBudgets(Long userId) {
        return utilityBudgetRepository.findByUserId(userId);
    }
}
