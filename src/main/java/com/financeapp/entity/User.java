package com.financeapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = {
		@UniqueConstraint(name = "uk_users_email", columnNames = {"email"})
})
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank
	@Size(max = 100)
	@Column(nullable = false)
	private String fullName;

	@NotBlank
	@Email
	@Size(max = 255)
	@Column(nullable = false, length = 255)
	private String email;

	@NotBlank
	@Size(min = 8, max = 255)
	@Column(nullable = false, length = 255)
	private String passwordHash;

	@Column(nullable = false)
	private OffsetDateTime createdAt = OffsetDateTime.now();

	@OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<Account> accounts = new HashSet<>();

	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<Budget> budgets = new HashSet<>();

	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<FinancialGoal> financialGoals = new HashSet<>();

	public Long getId() { return id; }
	public String getFullName() { return fullName; }
	public void setFullName(String fullName) { this.fullName = fullName; }
	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }
	public String getPasswordHash() { return passwordHash; }
	public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
	public OffsetDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
	public Set<Account> getAccounts() { return accounts; }
	public void setAccounts(Set<Account> accounts) { this.accounts = accounts; }
	public Set<Budget> getBudgets() { return budgets; }
	public void setBudgets(Set<Budget> budgets) { this.budgets = budgets; }
	public Set<FinancialGoal> getFinancialGoals() { return financialGoals; }
	public void setFinancialGoals(Set<FinancialGoal> financialGoals) { this.financialGoals = financialGoals; }
}


