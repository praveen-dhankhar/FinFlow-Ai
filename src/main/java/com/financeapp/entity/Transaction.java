package com.financeapp.entity;

import com.financeapp.entity.enums.TransactionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotNull
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 50)
	private TransactionType type;

	@NotNull
	@DecimalMin(value = "0.00")
	@Column(nullable = false, precision = 19, scale = 2)
	private BigDecimal amount;

	@NotBlank
	@Size(max = 255)
	@Column(nullable = false)
	private String description;

	@Column(nullable = false)
	private OffsetDateTime timestamp = OffsetDateTime.now();

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "account_id", nullable = false, foreignKey = @ForeignKey(name = "fk_transaction_account"))
	private Account account;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "budget_id", foreignKey = @ForeignKey(name = "fk_transaction_budget"))
	private Budget budget;

	public Long getId() { return id; }
	public TransactionType getType() { return type; }
	public void setType(TransactionType type) { this.type = type; }
	public BigDecimal getAmount() { return amount; }
	public void setAmount(BigDecimal amount) { this.amount = amount; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
	public OffsetDateTime getTimestamp() { return timestamp; }
	public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }
	public Account getAccount() { return account; }
	public void setAccount(Account account) { this.account = account; }
	public Budget getBudget() { return budget; }
	public void setBudget(Budget budget) { this.budget = budget; }
}


