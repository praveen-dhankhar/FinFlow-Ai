package com.financeapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.financeapp.entity.enums.Category;
import com.financeapp.entity.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for updating financial data
 */
public record FinancialDataUpdateDto(
    @JsonProperty("date")
    @PastOrPresent(message = "Date cannot be in the future")
    LocalDate date,
    
    @JsonProperty("amount")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    BigDecimal amount,
    
    @JsonProperty("category")
    Category category,
    
    @JsonProperty("description")
    @Size(max = 500, message = "Description must not exceed 500 characters")
    String description,
    
    @JsonProperty("type")
    TransactionType type
) {
    public FinancialDataUpdateDto {
        if (amount != null && amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (description != null) {
            description = description.trim();
        }
    }
    
    /**
     * Check if any field is being updated
     */
    public boolean hasUpdates() {
        return date != null || amount != null || category != null || 
               description != null || type != null;
    }
}
