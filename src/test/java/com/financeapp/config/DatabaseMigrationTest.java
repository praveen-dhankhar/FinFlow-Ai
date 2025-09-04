package com.financeapp.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class DatabaseMigrationTest {

	@Autowired
	JdbcTemplate jdbcTemplate;

	@Test
	void allCoreTablesExist() {
		String[] tables = {
				"USERS",
				"FINANCIAL_DATA",
				"FORECASTS",
				"CATEGORIES",
				"USER_SETTINGS"
		};
		for (String table : tables) {
			Integer count = jdbcTemplate.queryForObject(
					"SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE UPPER(TABLE_NAME) = ?",
					Integer.class,
					table
			);
			assertThat(count).isNotNull();
			assertThat(count).isGreaterThanOrEqualTo(1);
		}
	}
}


