package com.financeapp.service;

import com.financeapp.dto.UserRegistrationDto;
import com.financeapp.dto.UserResponseDto;
import com.financeapp.dto.UserUpdateDto;
import com.financeapp.entity.User;
import com.financeapp.exception.InvalidPasswordException;
import com.financeapp.exception.UserAlreadyExistsException;
import com.financeapp.exception.UserNotFoundException;
import com.financeapp.exception.ValidationException;
import com.financeapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for UserService.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserServiceIntegrationTest {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @BeforeEach
    void setUp() {
        // Clean up all data in proper order to avoid foreign key constraints
        // This will cascade delete related records
        userRepository.deleteAll();
    }
    
    @Test
    @DisplayName("Should register and authenticate user successfully")
    void registerAndAuthenticateUser_Success() {
        // Given
        UserRegistrationDto registrationDto = new UserRegistrationDto(
            "testuser",
            "test@example.com",
            "Password123!"
        );
        
        // When
        UserResponseDto registeredUser = userService.registerUser(registrationDto);
        UserResponseDto authenticatedUser = userService.authenticate("testuser", "Password123!");
        
        // Then
        assertThat(registeredUser).isNotNull();
        assertThat(registeredUser.username()).isEqualTo("testuser");
        assertThat(registeredUser.email()).isEqualTo("test@example.com");
        
        assertThat(authenticatedUser).isNotNull();
        assertThat(authenticatedUser.id()).isEqualTo(registeredUser.id());
        assertThat(authenticatedUser.username()).isEqualTo("testuser");
        
        // Verify user exists in database
        User savedUser = userRepository.findById(registeredUser.id()).orElse(null);
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getUsername()).isEqualTo("testuser");
        assertThat(savedUser.getEmail()).isEqualTo("test@example.com");
        assertThat(passwordEncoder.matches("Password123!", savedUser.getPasswordHash())).isTrue();
    }
    
    @Test
    @DisplayName("Should find user by different criteria")
    void findUserByDifferentCriteria_Success() {
        // Given
        UserRegistrationDto registrationDto = new UserRegistrationDto(
            "testuser",
            "test@example.com",
            "Password123!"
        );
        UserResponseDto registeredUser = userService.registerUser(registrationDto);
        
        // When & Then
        UserResponseDto byId = userService.findById(registeredUser.id());
        UserResponseDto byUsername = userService.findByUsername("testuser");
        UserResponseDto byEmail = userService.findByEmail("test@example.com");
        
        assertThat(byId).isNotNull();
        assertThat(byId.id()).isEqualTo(registeredUser.id());
        
        assertThat(byUsername).isNotNull();
        assertThat(byUsername.username()).isEqualTo("testuser");
        
        assertThat(byEmail).isNotNull();
        assertThat(byEmail.email()).isEqualTo("test@example.com");
    }
    
    @Test
    @DisplayName("Should update user profile successfully")
    void updateUserProfile_Success() {
        // Given
        UserRegistrationDto registrationDto = new UserRegistrationDto(
            "testuser",
            "test@example.com",
            "Password123!"
        );
        UserResponseDto registeredUser = userService.registerUser(registrationDto);
        
        UserUpdateDto updateDto = new UserUpdateDto(
            "updateduser",
            "updated@example.com",
            null
        );
        
        // When
        UserResponseDto updatedUser = userService.updateUser(registeredUser.id(), updateDto);
        
        // Then
        assertThat(updatedUser).isNotNull();
        assertThat(updatedUser.username()).isEqualTo("updateduser");
        assertThat(updatedUser.email()).isEqualTo("updated@example.com");
        
        // Verify in database
        User savedUser = userRepository.findById(registeredUser.id()).orElse(null);
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getUsername()).isEqualTo("updateduser");
        assertThat(savedUser.getEmail()).isEqualTo("updated@example.com");
    }
    
    @Test
    @DisplayName("Should update password successfully")
    void updatePassword_Success() {
        // Given
        UserRegistrationDto registrationDto = new UserRegistrationDto(
            "testuser",
            "test@example.com",
            "Password123!"
        );
        UserResponseDto registeredUser = userService.registerUser(registrationDto);
        
        // When
        userService.updatePassword(registeredUser.id(), "Password123!", "NewPassword456!");
        
        // Then
        // Verify old password doesn't work
        assertThatThrownBy(() -> userService.authenticate("testuser", "Password123!"))
            .isInstanceOf(InvalidPasswordException.class);
        
        // Verify new password works
        UserResponseDto authenticatedUser = userService.authenticate("testuser", "NewPassword456!");
        assertThat(authenticatedUser).isNotNull();
        assertThat(authenticatedUser.username()).isEqualTo("testuser");
    }
    
    @Test
    @DisplayName("Should delete user successfully")
    void deleteUser_Success() {
        // Given
        UserRegistrationDto registrationDto = new UserRegistrationDto(
            "testuser",
            "test@example.com",
            "Password123!"
        );
        UserResponseDto registeredUser = userService.registerUser(registrationDto);
        
        // When
        userService.deleteUser(registeredUser.id());
        
        // Then
        assertThatThrownBy(() -> userService.findById(registeredUser.id()))
            .isInstanceOf(UserNotFoundException.class);
        
        assertThat(userRepository.existsById(registeredUser.id())).isFalse();
    }
    
    @Test
    @DisplayName("Should check username and email existence")
    void checkExistence_Success() {
        // Given
        UserRegistrationDto registrationDto = new UserRegistrationDto(
            "testuser",
            "test@example.com",
            "Password123!"
        );
        userService.registerUser(registrationDto);
        
        // When & Then
        assertThat(userService.existsByUsername("testuser")).isTrue();
        assertThat(userService.existsByUsername("nonexistent")).isFalse();
        
        assertThat(userService.existsByEmail("test@example.com")).isTrue();
        assertThat(userService.existsByEmail("nonexistent@example.com")).isFalse();
    }
    
    @Test
    @DisplayName("Should get all users with pagination")
    void getAllUsers_Success() {
        // Given
        UserRegistrationDto user1 = new UserRegistrationDto(
            "user1",
            "user1@example.com",
            "Password123!"
        );
        UserRegistrationDto user2 = new UserRegistrationDto(
            "user2",
            "user2@example.com",
            "Password123!"
        );
        UserRegistrationDto user3 = new UserRegistrationDto(
            "user3",
            "user3@example.com",
            "Password123!"
        );
        
        userService.registerUser(user1);
        userService.registerUser(user2);
        userService.registerUser(user3);
        
        // When
        List<UserResponseDto> allUsers = userService.getAllUsers(0, 10);
        List<UserResponseDto> firstPage = userService.getAllUsers(0, 2);
        List<UserResponseDto> secondPage = userService.getAllUsers(1, 2);
        
        // Then
        assertThat(allUsers).hasSize(3);
        assertThat(firstPage).hasSize(2);
        assertThat(secondPage).hasSize(1);
    }
    
    @Test
    @DisplayName("Should throw UserAlreadyExistsException for duplicate username")
    void registerUser_DuplicateUsername_ThrowsException() {
        // Given
        UserRegistrationDto firstUser = new UserRegistrationDto(
            "testuser",
            "test1@example.com",
            "Password123!"
        );
        UserRegistrationDto secondUser = new UserRegistrationDto(
            "testuser",
            "test2@example.com",
            "Password123!"
        );
        
        userService.registerUser(firstUser);
        
        // When & Then
        assertThatThrownBy(() -> userService.registerUser(secondUser))
            .isInstanceOf(UserAlreadyExistsException.class)
            .hasMessage("User already exists with username: testuser");
    }
    
    @Test
    @DisplayName("Should throw UserAlreadyExistsException for duplicate email")
    void registerUser_DuplicateEmail_ThrowsException() {
        // Given
        UserRegistrationDto firstUser = new UserRegistrationDto(
            "user1",
            "test@example.com",
            "Password123!"
        );
        UserRegistrationDto secondUser = new UserRegistrationDto(
            "user2",
            "test@example.com",
            "Password123!"
        );
        
        userService.registerUser(firstUser);
        
        // When & Then
        assertThatThrownBy(() -> userService.registerUser(secondUser))
            .isInstanceOf(UserAlreadyExistsException.class)
            .hasMessage("User already exists with email: test@example.com");
    }
    
    @Test
    @DisplayName("Should throw ValidationException for weak password")
    void registerUser_WeakPassword_ThrowsException() {
        // Given
        UserRegistrationDto weakPasswordUser = new UserRegistrationDto(
            "testuser",
            "test@example.com",
            "weak"
        );
        
        // When & Then
        assertThatThrownBy(() -> userService.registerUser(weakPasswordUser))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("Password must be at least 8 characters long");
    }
    
    @Test
    @DisplayName("Should throw ValidationException for invalid email format")
    void registerUser_InvalidEmail_ThrowsException() {
        // Given
        UserRegistrationDto invalidEmailUser = new UserRegistrationDto(
            "testuser",
            "invalid-email",
            "Password123!"
        );
        
        // When & Then
        assertThatThrownBy(() -> userService.registerUser(invalidEmailUser))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("Invalid email format");
    }
    
    @Test
    @DisplayName("Should throw UserNotFoundException for non-existent user")
    void findById_NonExistentUser_ThrowsException() {
        // When & Then
        assertThatThrownBy(() -> userService.findById(999L))
            .isInstanceOf(UserNotFoundException.class)
            .hasMessage("User not found with ID: 999");
    }
    
    @Test
    @DisplayName("Should throw InvalidPasswordException for incorrect password during authentication")
    void authenticate_IncorrectPassword_ThrowsException() {
        // Given
        UserRegistrationDto registrationDto = new UserRegistrationDto(
            "testuser",
            "test@example.com",
            "Password123!"
        );
        userService.registerUser(registrationDto);
        
        // When & Then
        assertThatThrownBy(() -> userService.authenticate("testuser", "WrongPassword"))
            .isInstanceOf(InvalidPasswordException.class)
            .hasMessage("Incorrect password provided");
    }
    
    @Test
    @DisplayName("Should throw InvalidPasswordException when new password same as current")
    void updatePassword_SamePassword_ThrowsException() {
        // Given
        UserRegistrationDto registrationDto = new UserRegistrationDto(
            "testuser",
            "test@example.com",
            "Password123!"
        );
        UserResponseDto registeredUser = userService.registerUser(registrationDto);
        
        // When & Then
        assertThatThrownBy(() -> userService.updatePassword(registeredUser.id(), "Password123!", "Password123!"))
            .isInstanceOf(InvalidPasswordException.class)
            .hasMessage("New password must be different from current password");
    }
    
    @Test
    @DisplayName("Should handle username conflicts during update")
    void updateUser_UsernameConflict_ThrowsException() {
        // Given
        UserRegistrationDto user1 = new UserRegistrationDto(
            "user1",
            "user1@example.com",
            "Password123!"
        );
        UserRegistrationDto user2 = new UserRegistrationDto(
            "user2",
            "user2@example.com",
            "Password123!"
        );
        
        UserResponseDto registeredUser1 = userService.registerUser(user1);
        UserResponseDto registeredUser2 = userService.registerUser(user2);
        
        UserUpdateDto updateDto = new UserUpdateDto(
            "user1", // Try to use user1's username
            "user2@example.com",
            null
        );
        
        // When & Then
        assertThatThrownBy(() -> userService.updateUser(registeredUser2.id(), updateDto))
            .isInstanceOf(UserAlreadyExistsException.class)
            .hasMessage("User already exists with username: user1");
    }
    
    @Test
    @DisplayName("Should handle email conflicts during update")
    void updateUser_EmailConflict_ThrowsException() {
        // Given
        UserRegistrationDto user1 = new UserRegistrationDto(
            "user1",
            "user1@example.com",
            "Password123!"
        );
        UserRegistrationDto user2 = new UserRegistrationDto(
            "user2",
            "user2@example.com",
            "Password123!"
        );
        
        UserResponseDto registeredUser1 = userService.registerUser(user1);
        UserResponseDto registeredUser2 = userService.registerUser(user2);
        
        UserUpdateDto updateDto = new UserUpdateDto(
            "user2",
            "user1@example.com", // Try to use user1's email
            null
        );
        
        // When & Then
        assertThatThrownBy(() -> userService.updateUser(registeredUser2.id(), updateDto))
            .isInstanceOf(UserAlreadyExistsException.class)
            .hasMessage("User already exists with email: user1@example.com");
    }
    
    @Test
    @DisplayName("Should handle update with no changes")
    void updateUser_NoChanges_Success() {
        // Given
        UserRegistrationDto registrationDto = new UserRegistrationDto(
            "testuser",
            "test@example.com",
            "Password123!"
        );
        UserResponseDto registeredUser = userService.registerUser(registrationDto);
        
        UserUpdateDto updateDto = new UserUpdateDto(
            "testuser", // Same username
            "test@example.com", // Same email
            null // No password change
        );
        
        // When
        UserResponseDto updatedUser = userService.updateUser(registeredUser.id(), updateDto);
        
        // Then
        assertThat(updatedUser).isNotNull();
        assertThat(updatedUser.username()).isEqualTo("testuser");
        assertThat(updatedUser.email()).isEqualTo("test@example.com");
    }
}
