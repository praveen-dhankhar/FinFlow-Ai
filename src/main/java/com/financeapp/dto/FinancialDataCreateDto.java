package com.financeapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.financeapp.entity.enums.Category;
import com.financeapp.entity.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for creating financial data
 */
public record FinancialDataCreateDto(
    @JsonProperty("userId")
    @NotNull(message = "User ID is required")
    Long userId,
    
    @JsonProperty("date")
    @NotNull(message = "Date is required")
    @PastOrPresent(message = "Date cannot be in the future")
    LocalDate date,
    
    @JsonProperty("amount")
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    BigDecimal amount,
    
    @JsonProperty("category")
    @NotNull(message = "Category is required")
    Category category,
    
    @JsonProperty("description")
    @Size(max = 500, message = "Description must not exceed 500 characters")
    String description,
    
    @JsonProperty("type")
    @NotNull(message = "Type is required")
    TransactionType type
) {
    public FinancialDataCreateDto {
        if (description != null) {
            description = description.trim();
        }
    }
}
