package com.financeapp.entity;

import com.financeapp.entity.enums.BudgetPeriod;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "budgets")
public class Budget {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank
	@Size(max = 100)
	@Column(nullable = false, length = 100)
	private String category;

	@NotNull
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 50)
	private BudgetPeriod period;

	@NotNull
	@DecimalMin(value = "0.00")
	@Column(nullable = false, precision = 19, scale = 2)
	private BigDecimal limitAmount;

	@NotNull
	@Column(nullable = false)
	private LocalDate startDate;

	@NotNull
	@Column(nullable = false)
	private LocalDate endDate;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_budget_user"))
	private User user;

	@OneToMany(mappedBy = "budget")
	private Set<Transaction> transactions = new HashSet<>();

	public Long getId() { return id; }
	public String getCategory() { return category; }
	public void setCategory(String category) { this.category = category; }
	public BudgetPeriod getPeriod() { return period; }
	public void setPeriod(BudgetPeriod period) { this.period = period; }
	public BigDecimal getLimitAmount() { return limitAmount; }
	public void setLimitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; }
	public LocalDate getStartDate() { return startDate; }
	public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
	public LocalDate getEndDate() { return endDate; }
	public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }
	public Set<Transaction> getTransactions() { return transactions; }
	public void setTransactions(Set<Transaction> transactions) { this.transactions = transactions; }
}


