package com.financeapp.dto.mapper;

import com.financeapp.dto.FinancialDataCreateDto;
import com.financeapp.dto.FinancialDataDto;
import com.financeapp.dto.FinancialDataUpdateDto;
import com.financeapp.entity.FinancialData;
import com.financeapp.entity.User;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

/**
 * Mapper utility for FinancialData entity and DTOs
 */
@Component
public class FinancialDataMapper {
    
    /**
     * Convert FinancialData entity to FinancialDataDto
     */
    public FinancialDataDto toDto(FinancialData financialData) {
        if (financialData == null) {
            return null;
        }
        
        return new FinancialDataDto(
            financialData.getId(),
            financialData.getUser().getId(),
            financialData.getDate(),
            financialData.getAmount(),
            financialData.getCategory(),
            financialData.getDescription(),
            financialData.getType(),
            financialData.getCreatedAt(),
            financialData.getUpdatedAt()
        );
    }
    
    /**
     * Convert FinancialDataCreateDto to FinancialData entity
     */
    public FinancialData toEntity(FinancialDataCreateDto dto, User user) {
        if (dto == null || user == null) {
            return null;
        }
        
        FinancialData financialData = new FinancialData();
        financialData.setUser(user);
        financialData.setDate(dto.date());
        financialData.setAmount(dto.amount());
        financialData.setCategory(dto.category());
        financialData.setDescription(dto.description());
        financialData.setType(dto.type());
        financialData.setCreatedAt(OffsetDateTime.now());
        financialData.setUpdatedAt(OffsetDateTime.now());
        
        return financialData;
    }
    
    /**
     * Update FinancialData entity with FinancialDataUpdateDto
     */
    public void updateEntity(FinancialData financialData, FinancialDataUpdateDto dto) {
        if (financialData == null || dto == null) {
            return;
        }
        
        if (dto.date() != null) {
            financialData.setDate(dto.date());
        }
        if (dto.amount() != null) {
            financialData.setAmount(dto.amount());
        }
        if (dto.category() != null) {
            financialData.setCategory(dto.category());
        }
        if (dto.description() != null) {
            financialData.setDescription(dto.description());
        }
        if (dto.type() != null) {
            financialData.setType(dto.type());
        }
        financialData.setUpdatedAt(OffsetDateTime.now());
    }
    
    /**
     * Create FinancialDataUpdateDto from FinancialData entity
     */
    public FinancialDataUpdateDto toUpdateDto(FinancialData financialData) {
        if (financialData == null) {
            return null;
        }
        
        return new FinancialDataUpdateDto(
            financialData.getDate(),
            financialData.getAmount(),
            financialData.getCategory(),
            financialData.getDescription(),
            financialData.getType()
        );
    }
}
