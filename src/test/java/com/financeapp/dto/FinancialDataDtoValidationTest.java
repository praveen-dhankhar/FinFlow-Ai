package com.financeapp.dto;

import com.financeapp.entity.enums.Category;
import com.financeapp.entity.enums.TransactionType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for Financial Data DTO validation
 */
class FinancialDataDtoValidationTest {
    
    private Validator validator;
    
    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }
    
    @Test
    void financialDataCreateDto_validData_shouldPassValidation() {
        // Given
        FinancialDataCreateDto dto = new FinancialDataCreateDto(
            1L,
            LocalDate.now(),
            new BigDecimal("100.50"),
            Category.SALARY,
            "Monthly salary",
            TransactionType.INCOME
        );
        
        // When
        Set<ConstraintViolation<FinancialDataCreateDto>> violations = validator.validate(dto);
        
        // Then
        assertThat(violations).isEmpty();
    }
    
    @Test
    void financialDataCreateDto_invalidData_shouldFailValidation() {
        // Given
        FinancialDataCreateDto dto = new FinancialDataCreateDto(
            null, // Invalid: null user ID
            LocalDate.now().plusDays(1), // Invalid: future date
            new BigDecimal("-10.00"), // Invalid: negative amount
            null, // Invalid: null category
            "A".repeat(501), // Invalid: description too long
            null  // Invalid: null type
        );
        
        // When
        Set<ConstraintViolation<FinancialDataCreateDto>> violations = validator.validate(dto);
        
        // Then
        assertThat(violations).hasSize(6);
        assertThat(violations).extracting("message")
            .contains(
                "User ID is required",
                "Date cannot be in the future",
                "Amount must be greater than 0",
                "Category is required",
                "Description must not exceed 500 characters",
                "Type is required"
            );
    }
    
    @Test
    void financialDataCreateDto_zeroAmount_shouldFailValidation() {
        // Given
        FinancialDataCreateDto dto = new FinancialDataCreateDto(
            1L,
            LocalDate.now(),
            BigDecimal.ZERO, // Invalid: zero amount
            Category.SALARY,
            "Zero amount transaction",
            TransactionType.INCOME
        );
        
        // When
        Set<ConstraintViolation<FinancialDataCreateDto>> violations = validator.validate(dto);
        
        // Then
        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessage())
            .isEqualTo("Amount must be greater than 0");
    }
    
    @Test
    void financialDataUpdateDto_validData_shouldPassValidation() {
        // Given
        FinancialDataUpdateDto dto = new FinancialDataUpdateDto(
            LocalDate.now(),
            new BigDecimal("200.00"),
            Category.ENTERTAINMENT,
            "Updated description",
            TransactionType.EXPENSE
        );
        
        // When
        Set<ConstraintViolation<FinancialDataUpdateDto>> violations = validator.validate(dto);
        
        // Then
        assertThat(violations).isEmpty();
    }
    
    @Test
    void financialDataUpdateDto_partialData_shouldPassValidation() {
        // Given
        FinancialDataUpdateDto dto = new FinancialDataUpdateDto(
            null, // Optional field
            new BigDecimal("200.00"),
            null, // Optional field
            null, // Optional field
            null  // Optional field
        );
        
        // When
        Set<ConstraintViolation<FinancialDataUpdateDto>> violations = validator.validate(dto);
        
        // Then
        assertThat(violations).isEmpty();
    }
    
    @Test
    void financialDataUpdateDto_hasUpdates_shouldReturnTrue() {
        // Given
        FinancialDataUpdateDto dto = new FinancialDataUpdateDto(
            LocalDate.now(),
            new BigDecimal("200.00"),
            Category.ENTERTAINMENT,
            "Updated description",
            TransactionType.EXPENSE
        );
        
        // When
        boolean hasUpdates = dto.hasUpdates();
        
        // Then
        assertThat(hasUpdates).isTrue();
    }
    
    @Test
    void financialDataUpdateDto_noUpdates_shouldReturnFalse() {
        // Given
        FinancialDataUpdateDto dto = new FinancialDataUpdateDto(null, null, null, null, null);
        
        // When
        boolean hasUpdates = dto.hasUpdates();
        
        // Then
        assertThat(hasUpdates).isFalse();
    }
}
