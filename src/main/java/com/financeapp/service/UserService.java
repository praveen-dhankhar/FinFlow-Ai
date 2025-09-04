package com.financeapp.service;

import com.financeapp.dto.UserRegistrationDto;
import com.financeapp.dto.UserResponseDto;
import com.financeapp.dto.UserUpdateDto;
import com.financeapp.entity.User;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for user management operations.
 */
public interface UserService {
    
    /**
     * Register a new user with encrypted password.
     *
     * @param registrationDto the user registration data
     * @return the created user response DTO
     * @throws UserAlreadyExistsException if user with username or email already exists
     * @throws ValidationException if validation fails
     */
    UserResponseDto registerUser(UserRegistrationDto registrationDto);
    
    /**
     * Find user by ID.
     *
     * @param id the user ID
     * @return the user if found
     * @throws UserNotFoundException if user not found
     */
    UserResponseDto findById(Long id);
    
    /**
     * Find user by username.
     *
     * @param username the username
     * @return the user if found
     * @throws UserNotFoundException if user not found
     */
    UserResponseDto findByUsername(String username);
    
    /**
     * Find user by email.
     *
     * @param email the email
     * @return the user if found
     * @throws UserNotFoundException if user not found
     */
    UserResponseDto findByEmail(String email);
    
    /**
     * Get all users with pagination.
     *
     * @param page the page number (0-based)
     * @param size the page size
     * @return list of user response DTOs
     */
    List<UserResponseDto> getAllUsers(int page, int size);
    
    /**
     * Update user profile.
     *
     * @param id the user ID
     * @param updateDto the update data
     * @return the updated user response DTO
     * @throws UserNotFoundException if user not found
     * @throws UserAlreadyExistsException if username or email already exists
     * @throws ValidationException if validation fails
     */
    UserResponseDto updateUser(Long id, UserUpdateDto updateDto);
    
    /**
     * Update user password.
     *
     * @param id the user ID
     * @param currentPassword the current password
     * @param newPassword the new password
     * @throws UserNotFoundException if user not found
     * @throws InvalidPasswordException if password validation fails
     */
    void updatePassword(Long id, String currentPassword, String newPassword);
    
    /**
     * Delete user by ID.
     *
     * @param id the user ID
     * @throws UserNotFoundException if user not found
     */
    void deleteUser(Long id);
    
    /**
     * Check if username exists.
     *
     * @param username the username
     * @return true if exists, false otherwise
     */
    boolean existsByUsername(String username);
    
    /**
     * Check if email exists.
     *
     * @param email the email
     * @return true if exists, false otherwise
     */
    boolean existsByEmail(String email);
    
    /**
     * Authenticate user with username and password.
     *
     * @param username the username
     * @param password the password
     * @return the user if authentication successful
     * @throws UserNotFoundException if user not found
     * @throws InvalidPasswordException if password is incorrect
     */
    UserResponseDto authenticate(String username, String password);
    
    /**
     * Get user entity by ID (for internal use).
     *
     * @param id the user ID
     * @return the user entity
     * @throws UserNotFoundException if user not found
     */
    User getUserEntity(Long id);
}
