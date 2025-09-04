package com.financeapp.repository;

import com.financeapp.entity.FinancialData;
import com.financeapp.entity.User;
import com.financeapp.entity.enums.Category;
import com.financeapp.entity.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for FinancialData entity
 */
@Repository
public interface FinancialDataRepository extends JpaRepository<FinancialData, Long> {

    /**
     * Find all financial data for a specific user
     */
    List<FinancialData> findByUser(User user);

    /**
     * Find all financial data for a specific user with pagination
     */
    Page<FinancialData> findByUser(User user, Pageable pageable);

    /**
     * Find financial data by user and date range
     */
    List<FinancialData> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);

    /**
     * Find financial data by user and category
     */
    List<FinancialData> findByUserAndCategory(User user, Category category);

    /**
     * Find financial data by user and transaction type
     */
    List<FinancialData> findByUserAndType(User user, TransactionType type);

    /**
     * Find financial data by user, category, and date range
     */
    List<FinancialData> findByUserAndCategoryAndDateBetween(User user, Category category, 
                                                           LocalDate startDate, LocalDate endDate);

    /**
     * Calculate total amount by user and transaction type
     */
    @Query("SELECT SUM(fd.amount) FROM FinancialData fd WHERE fd.user = :user AND fd.type = :type")
    BigDecimal sumAmountByUserAndType(@Param("user") User user, @Param("type") TransactionType type);

    /**
     * Calculate total amount by user, type, and date range
     */
    @Query("SELECT SUM(fd.amount) FROM FinancialData fd WHERE fd.user = :user AND fd.type = :type " +
           "AND fd.date BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByUserAndTypeAndDateRange(@Param("user") User user, 
                                                 @Param("type") TransactionType type,
                                                 @Param("startDate") LocalDate startDate, 
                                                 @Param("endDate") LocalDate endDate);

    /**
     * Calculate total amount by user and category
     */
    @Query("SELECT SUM(fd.amount) FROM FinancialData fd WHERE fd.user = :user AND fd.category = :category")
    BigDecimal sumAmountByUserAndCategory(@Param("user") User user, @Param("category") Category category);

    /**
     * Find recent financial data for a user
     */
    @Query("SELECT fd FROM FinancialData fd WHERE fd.user = :user ORDER BY fd.date DESC, fd.createdAt DESC")
    List<FinancialData> findRecentByUser(@Param("user") User user, Pageable pageable);

    /**
     * Count financial data entries by user
     */
    long countByUser(User user);

    /**
     * Find financial data by user and amount range
     */
    List<FinancialData> findByUserAndAmountBetween(User user, BigDecimal minAmount, BigDecimal maxAmount);
}
