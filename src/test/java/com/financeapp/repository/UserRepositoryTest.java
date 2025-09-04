package com.financeapp.repository;

import com.financeapp.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Repository tests for User entity using @DataJpaTest
 */
@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser", "test@example.com", "hashedpassword123");
        entityManager.persistAndFlush(testUser);
    }

    @Test
    void testFindByUsername() {
        Optional<User> found = userRepository.findByUsername("testuser");
        
        assertTrue(found.isPresent(), "User should be found by username");
        assertEquals("testuser", found.get().getUsername());
        assertEquals("test@example.com", found.get().getEmail());
    }

    @Test
    void testFindByEmail() {
        Optional<User> found = userRepository.findByEmail("test@example.com");
        
        assertTrue(found.isPresent(), "User should be found by email");
        assertEquals("testuser", found.get().getUsername());
        assertEquals("test@example.com", found.get().getEmail());
    }

    @Test
    void testFindByUsernameOrEmail() {
        Optional<User> foundByUsername = userRepository.findByUsernameOrEmail("testuser");
        Optional<User> foundByEmail = userRepository.findByUsernameOrEmail("test@example.com");
        
        assertTrue(foundByUsername.isPresent(), "User should be found by username");
        assertTrue(foundByEmail.isPresent(), "User should be found by email");
        assertEquals(foundByUsername.get().getId(), foundByEmail.get().getId());
    }

    @Test
    void testExistsByUsername() {
        assertTrue(userRepository.existsByUsername("testuser"), "Username should exist");
        assertFalse(userRepository.existsByUsername("nonexistent"), "Non-existent username should not exist");
    }

    @Test
    void testExistsByEmail() {
        assertTrue(userRepository.existsByEmail("test@example.com"), "Email should exist");
        assertFalse(userRepository.existsByEmail("nonexistent@example.com"), "Non-existent email should not exist");
    }

    @Test
    void testCountAllUsers() {
        long count = userRepository.countAllUsers();
        assertEquals(1, count, "Should have 1 user");
        
        // Add another user
        User anotherUser = new User("anotheruser", "another@example.com", "password123");
        entityManager.persistAndFlush(anotherUser);
        
        count = userRepository.countAllUsers();
        assertEquals(2, count, "Should have 2 users");
    }

    @Test
    void testSaveUser() {
        User newUser = new User("newuser", "new@example.com", "password123");
        User saved = userRepository.save(newUser);
        
        assertNotNull(saved.getId(), "Saved user should have an ID");
        assertEquals("newuser", saved.getUsername());
        assertEquals("new@example.com", saved.getEmail());
    }

    @Test
    void testDeleteUser() {
        userRepository.delete(testUser);
        entityManager.flush();
        
        Optional<User> found = userRepository.findByUsername("testuser");
        assertFalse(found.isPresent(), "Deleted user should not be found");
    }
}
