package com.financeapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "financial_goals")
public class FinancialGoal {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank
	@Size(max = 150)
	@Column(nullable = false, length = 150)
	private String title;

	@Size(max = 500)
	private String description;

	@NotNull
	@DecimalMin(value = "0.00")
	@Column(nullable = false, precision = 19, scale = 2)
	private BigDecimal targetAmount;

	@NotNull
	@Column(nullable = false)
	private LocalDate targetDate;

	@NotNull
	@DecimalMin(value = "0.00")
	@Column(nullable = false, precision = 19, scale = 2)
	private BigDecimal currentAmount = BigDecimal.ZERO;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_goal_user"))
	private User user;

	public Long getId() { return id; }
	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
	public BigDecimal getTargetAmount() { return targetAmount; }
	public void setTargetAmount(BigDecimal targetAmount) { this.targetAmount = targetAmount; }
	public LocalDate getTargetDate() { return targetDate; }
	public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
	public BigDecimal getCurrentAmount() { return currentAmount; }
	public void setCurrentAmount(BigDecimal currentAmount) { this.currentAmount = currentAmount; }
	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }
}


