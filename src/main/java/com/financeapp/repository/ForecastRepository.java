package com.financeapp.repository;

import com.financeapp.entity.Forecast;
import com.financeapp.entity.User;
import com.financeapp.entity.Forecast.ForecastStatus;
import com.financeapp.entity.Forecast.ForecastType;
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
 * Repository interface for Forecast entity
 */
@Repository
public interface ForecastRepository extends JpaRepository<Forecast, Long> {

    /**
     * Find all forecasts for a specific user
     */
    List<Forecast> findByUser(User user);

    /**
     * Find all forecasts for a specific user with pagination
     */
    Page<Forecast> findByUser(User user, Pageable pageable);

    /**
     * Find forecasts by user and status
     */
    List<Forecast> findByUserAndStatus(User user, ForecastStatus status);

    /**
     * Find forecasts by user and type
     */
    List<Forecast> findByUserAndForecastType(User user, ForecastType forecastType);

    /**
     * Find forecasts by user and date range
     */
    List<Forecast> findByUserAndForecastDateBetween(User user, LocalDate startDate, LocalDate endDate);

    /**
     * Find active forecasts for a user
     */
    @Query("SELECT f FROM Forecast f WHERE f.user = :user AND f.status = 'ACTIVE' ORDER BY f.forecastDate ASC")
    List<Forecast> findActiveForecastsByUser(@Param("user") User user);

    /**
     * Find forecasts by confidence score range
     */
    List<Forecast> findByUserAndConfidenceScoreBetween(User user, BigDecimal minConfidence, BigDecimal maxConfidence);

    /**
     * Find high confidence forecasts (>= 0.8)
     */
    @Query("SELECT f FROM Forecast f WHERE f.user = :user AND f.confidenceScore >= 0.8 ORDER BY f.confidenceScore DESC")
    List<Forecast> findHighConfidenceForecastsByUser(@Param("user") User user);

    /**
     * Find forecasts by model name
     */
    List<Forecast> findByUserAndModelName(User user, String modelName);

    /**
     * Find upcoming forecasts (future dates)
     */
    @Query("SELECT f FROM Forecast f WHERE f.user = :user AND f.forecastDate > :currentDate ORDER BY f.forecastDate ASC")
    List<Forecast> findUpcomingForecastsByUser(@Param("user") User user, @Param("currentDate") LocalDate currentDate);

    /**
     * Calculate average confidence score by user
     */
    @Query("SELECT AVG(f.confidenceScore) FROM Forecast f WHERE f.user = :user")
    BigDecimal calculateAverageConfidenceByUser(@Param("user") User user);

    /**
     * Count forecasts by user and status
     */
    long countByUserAndStatus(User user, ForecastStatus status);

    /**
     * Find most recent forecast for a user
     */
    @Query("SELECT f FROM Forecast f WHERE f.user = :user ORDER BY f.createdAt DESC")
    List<Forecast> findMostRecentByUser(@Param("user") User user, Pageable pageable);

    /**
     * Find forecasts by predicted amount range
     */
    List<Forecast> findByUserAndPredictedAmountBetween(User user, BigDecimal minAmount, BigDecimal maxAmount);
}
