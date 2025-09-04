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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for FinancialData entity with comprehensive query methods
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
    
    /**
     * Find financial data by user ID with pagination
     */
    @Query("SELECT fd FROM FinancialData fd WHERE fd.user.id = :userId")
    Page<FinancialData> findByUserId(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Find financial data by user ID and date range with pagination
     */
    @Query("SELECT fd FROM FinancialData fd WHERE fd.user.id = :userId AND fd.date BETWEEN :startDate AND :endDate")
    Page<FinancialData> findByUserIdAndDateBetween(@Param("userId") Long userId, 
                                                  @Param("startDate") LocalDate startDate, 
                                                  @Param("endDate") LocalDate endDate, 
                                                  Pageable pageable);
    
    /**
     * Find financial data by user ID and category with pagination
     */
    @Query("SELECT fd FROM FinancialData fd WHERE fd.user.id = :userId AND fd.category = :category")
    Page<FinancialData> findByUserIdAndCategory(@Param("userId") Long userId, 
                                               @Param("category") Category category, 
                                               Pageable pageable);
    
    /**
     * Find financial data by user ID and transaction type with pagination
     */
    @Query("SELECT fd FROM FinancialData fd WHERE fd.user.id = :userId AND fd.type = :type")
    Page<FinancialData> findByUserIdAndType(@Param("userId") Long userId, 
                                           @Param("type") TransactionType type, 
                                           Pageable pageable);
    
    /**
     * Find financial data by user ID, category, and date range with pagination
     */
    @Query("SELECT fd FROM FinancialData fd WHERE fd.user.id = :userId AND fd.category = :category " +
           "AND fd.date BETWEEN :startDate AND :endDate")
    Page<FinancialData> findByUserIdAndCategoryAndDateBetween(@Param("userId") Long userId, 
                                                             @Param("category") Category category,
                                                             @Param("startDate") LocalDate startDate, 
                                                             @Param("endDate") LocalDate endDate, 
                                                             Pageable pageable);
    
    /**
     * Find financial data by user ID and amount range with pagination
     */
    @Query("SELECT fd FROM FinancialData fd WHERE fd.user.id = :userId AND fd.amount BETWEEN :minAmount AND :maxAmount")
    Page<FinancialData> findByUserIdAndAmountBetween(@Param("userId") Long userId, 
                                                    @Param("minAmount") BigDecimal minAmount, 
                                                    @Param("maxAmount") BigDecimal maxAmount, 
                                                    Pageable pageable);
    
    /**
     * Find financial data by description containing text (case-insensitive)
     */
    @Query("SELECT fd FROM FinancialData fd WHERE fd.user.id = :userId AND " +
           "LOWER(fd.description) LIKE LOWER(CONCAT('%', :description, '%'))")
    Page<FinancialData> findByUserIdAndDescriptionContainingIgnoreCase(@Param("userId") Long userId, 
                                                                      @Param("description") String description, 
                                                                      Pageable pageable);
    
    /**
     * Calculate total amount by user ID and transaction type
     */
    @Query("SELECT SUM(fd.amount) FROM FinancialData fd WHERE fd.user.id = :userId AND fd.type = :type")
    Optional<BigDecimal> sumAmountByUserIdAndType(@Param("userId") Long userId, @Param("type") TransactionType type);
    
    /**
     * Calculate total amount by user ID, type, and date range
     */
    @Query("SELECT SUM(fd.amount) FROM FinancialData fd WHERE fd.user.id = :userId AND fd.type = :type " +
           "AND fd.date BETWEEN :startDate AND :endDate")
    Optional<BigDecimal> sumAmountByUserIdAndTypeAndDateRange(@Param("userId") Long userId, 
                                                             @Param("type") TransactionType type,
                                                             @Param("startDate") LocalDate startDate, 
                                                             @Param("endDate") LocalDate endDate);
    
    /**
     * Calculate total amount by user ID and category
     */
    @Query("SELECT SUM(fd.amount) FROM FinancialData fd WHERE fd.user.id = :userId AND fd.category = :category")
    Optional<BigDecimal> sumAmountByUserIdAndCategory(@Param("userId") Long userId, @Param("category") Category category);
    
    /**
     * Calculate average amount by user ID and transaction type
     */
    @Query("SELECT AVG(fd.amount) FROM FinancialData fd WHERE fd.user.id = :userId AND fd.type = :type")
    Optional<BigDecimal> avgAmountByUserIdAndType(@Param("userId") Long userId, @Param("type") TransactionType type);
    
    /**
     * Calculate average amount by user ID and category
     */
    @Query("SELECT AVG(fd.amount) FROM FinancialData fd WHERE fd.user.id = :userId AND fd.category = :category")
    Optional<BigDecimal> avgAmountByUserIdAndCategory(@Param("userId") Long userId, @Param("category") Category category);
    
    /**
     * Find top N financial data entries by amount for a user
     */
    @Query("SELECT fd FROM FinancialData fd WHERE fd.user.id = :userId ORDER BY fd.amount DESC")
    List<FinancialData> findTopByUserIdOrderByAmountDesc(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Find financial data statistics by user ID
     * Returns: [totalEntries, totalIncome, totalExpense, avgAmount, minAmount, maxAmount]
     */
    @Query("SELECT COUNT(fd), " +
           "COALESCE(SUM(CASE WHEN fd.type = 'INCOME' THEN fd.amount ELSE 0 END), 0), " +
           "COALESCE(SUM(CASE WHEN fd.type = 'EXPENSE' THEN fd.amount ELSE 0 END), 0), " +
           "COALESCE(AVG(fd.amount), 0), " +
           "COALESCE(MIN(fd.amount), 0), " +
           "COALESCE(MAX(fd.amount), 0) " +
           "FROM FinancialData fd WHERE fd.user.id = :userId")
    Optional<Object[]> getFinancialDataStatistics(@Param("userId") Long userId);
    
    /**
     * Find financial data by category with amount aggregation
     * Returns: [category, count, totalAmount, avgAmount]
     */
    @Query("SELECT fd.category, COUNT(fd), SUM(fd.amount), AVG(fd.amount) " +
           "FROM FinancialData fd WHERE fd.user.id = :userId " +
           "GROUP BY fd.category ORDER BY SUM(fd.amount) DESC")
    List<Object[]> getFinancialDataByCategory(@Param("userId") Long userId);
    
    /**
     * Find financial data by month for a user
     * Returns: [year, month, count, totalAmount]
     */
    @Query("SELECT YEAR(fd.date), MONTH(fd.date), COUNT(fd), SUM(fd.amount) " +
           "FROM FinancialData fd WHERE fd.user.id = :userId " +
           "GROUP BY YEAR(fd.date), MONTH(fd.date) ORDER BY YEAR(fd.date) DESC, MONTH(fd.date) DESC")
    List<Object[]> getFinancialDataByMonth(@Param("userId") Long userId);
    
    /**
     * Find all financial data with pagination and sorting (admin only)
     */
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    Page<FinancialData> findAll(Pageable pageable);
    
    /**
     * Find financial data by multiple criteria with pagination
     */
    @Query("SELECT fd FROM FinancialData fd WHERE " +
           "(:userId IS NULL OR fd.user.id = :userId) AND " +
           "(:category IS NULL OR fd.category = :category) AND " +
           "(:type IS NULL OR fd.type = :type) AND " +
           "(:startDate IS NULL OR fd.date >= :startDate) AND " +
           "(:endDate IS NULL OR fd.date <= :endDate) AND " +
           "(:minAmount IS NULL OR fd.amount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR fd.amount <= :maxAmount)")
    Page<FinancialData> findByCriteria(@Param("userId") Long userId,
                                      @Param("category") Category category,
                                      @Param("type") TransactionType type,
                                      @Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate,
                                      @Param("minAmount") BigDecimal minAmount,
                                      @Param("maxAmount") BigDecimal maxAmount,
                                      Pageable pageable);
}
