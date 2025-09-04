package com.financeapp.service.impl;

import com.financeapp.dto.UserRegistrationDto;
import com.financeapp.dto.UserResponseDto;
import com.financeapp.dto.UserUpdateDto;
import com.financeapp.dto.mapper.UserMapper;
import com.financeapp.entity.User;
import com.financeapp.exception.InvalidPasswordException;
import com.financeapp.exception.UserAlreadyExistsException;
import com.financeapp.exception.UserNotFoundException;
import com.financeapp.exception.ValidationException;
import com.financeapp.repository.UserRepository;
import com.financeapp.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Implementation of UserService with business logic for user management.
 */
@Service
@Transactional
public class UserServiceImpl implements UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    
    // Password validation patterns
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );
    
    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final int MAX_PASSWORD_LENGTH = 100;
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    
    @Autowired
    public UserServiceImpl(UserRepository userRepository, 
                          PasswordEncoder passwordEncoder,
                          UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }
    
    @Override
    public UserResponseDto registerUser(UserRegistrationDto registrationDto) {
        logger.info("Attempting to register user with username: {}", registrationDto.username());
        
        // Validate input
        validateRegistrationData(registrationDto);
        
        // Check if user already exists
        if (existsByUsername(registrationDto.username())) {
            logger.warn("Registration failed: Username already exists: {}", registrationDto.username());
            throw UserAlreadyExistsException.withUsername(registrationDto.username());
        }
        
        if (existsByEmail(registrationDto.email())) {
            logger.warn("Registration failed: Email already exists: {}", registrationDto.email());
            throw UserAlreadyExistsException.withEmail(registrationDto.email());
        }
        
        // Create new user
        User user = userMapper.toEntity(registrationDto);
        user.setPasswordHash(passwordEncoder.encode(registrationDto.password()));
        
        User savedUser = userRepository.save(user);
        logger.info("User registered successfully with ID: {}", savedUser.getId());
        
        return userMapper.toResponseDto(savedUser);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponseDto findById(Long id) {
        logger.debug("Finding user by ID: {}", id);
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> {
                logger.warn("User not found with ID: {}", id);
                return UserNotFoundException.byId(id);
            });
        
        return userMapper.toResponseDto(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponseDto findByUsername(String username) {
        logger.debug("Finding user by username: {}", username);
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> {
                logger.warn("User not found with username: {}", username);
                return UserNotFoundException.byUsername(username);
            });
        
        return userMapper.toResponseDto(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponseDto findByEmail(String email) {
        logger.debug("Finding user by email: {}", email);
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> {
                logger.warn("User not found with email: {}", email);
                return UserNotFoundException.byEmail(email);
            });
        
        return userMapper.toResponseDto(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers(int page, int size) {
        logger.debug("Retrieving all users - page: {}, size: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        List<User> users = userRepository.findAll(pageable).getContent();
        
        return users.stream()
            .map(userMapper::toResponseDto)
            .toList();
    }
    
    @Override
    public UserResponseDto updateUser(Long id, UserUpdateDto updateDto) {
        logger.info("Updating user with ID: {}", id);
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> {
                logger.warn("User not found for update with ID: {}", id);
                return UserNotFoundException.byId(id);
            });
        
        // Check if there are any updates
        if (!updateDto.hasUpdates()) {
            logger.debug("No updates provided for user ID: {}", id);
            return userMapper.toResponseDto(user);
        }
        
        // Validate updates
        validateUpdateData(updateDto);
        
        // Check for username conflicts
        if (updateDto.username() != null && !updateDto.username().equals(user.getUsername())) {
            if (existsByUsername(updateDto.username())) {
                logger.warn("Update failed: Username already exists: {}", updateDto.username());
                throw UserAlreadyExistsException.withUsername(updateDto.username());
            }
        }
        
        // Check for email conflicts
        if (updateDto.email() != null && !updateDto.email().equals(user.getEmail())) {
            if (existsByEmail(updateDto.email())) {
                logger.warn("Update failed: Email already exists: {}", updateDto.email());
                throw UserAlreadyExistsException.withEmail(updateDto.email());
            }
        }
        
        // Update user
        userMapper.updateEntity(user, updateDto);
        User updatedUser = userRepository.save(user);
        
        logger.info("User updated successfully with ID: {}", updatedUser.getId());
        return userMapper.toResponseDto(updatedUser);
    }
    
    @Override
    public void updatePassword(Long id, String currentPassword, String newPassword) {
        logger.info("Updating password for user ID: {}", id);
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> {
                logger.warn("User not found for password update with ID: {}", id);
                return UserNotFoundException.byId(id);
            });
        
        // Validate current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            logger.warn("Password update failed: Incorrect current password for user ID: {}", id);
            throw InvalidPasswordException.incorrectPassword();
        }
        
        // Validate new password
        validatePassword(newPassword);
        
        // Check if new password is different from current
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            logger.warn("Password update failed: New password same as current for user ID: {}", id);
            throw InvalidPasswordException.sameAsCurrent();
        }
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        logger.info("Password updated successfully for user ID: {}", id);
    }
    
    @Override
    public void deleteUser(Long id) {
        logger.info("Deleting user with ID: {}", id);
        
        if (!userRepository.existsById(id)) {
            logger.warn("User not found for deletion with ID: {}", id);
            throw UserNotFoundException.byId(id);
        }
        
        userRepository.deleteById(id);
        logger.info("User deleted successfully with ID: {}", id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponseDto authenticate(String username, String password) {
        logger.debug("Authenticating user: {}", username);
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> {
                logger.warn("Authentication failed: User not found: {}", username);
                return UserNotFoundException.byUsername(username);
            });
        
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            logger.warn("Authentication failed: Incorrect password for user: {}", username);
            throw InvalidPasswordException.incorrectPassword();
        }
        
        logger.info("User authenticated successfully: {}", username);
        return userMapper.toResponseDto(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public User getUserEntity(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> UserNotFoundException.byId(id));
    }
    
    /**
     * Validate registration data.
     */
    private void validateRegistrationData(UserRegistrationDto registrationDto) {
        if (registrationDto == null) {
            throw new ValidationException("Registration data cannot be null");
        }
        
        // Username validation
        if (registrationDto.username() == null || registrationDto.username().trim().isEmpty()) {
            throw new ValidationException("Username is required");
        }
        
        if (registrationDto.username().length() < 3 || registrationDto.username().length() > 50) {
            throw new ValidationException("Username must be between 3 and 50 characters");
        }
        
        // Email validation
        if (registrationDto.email() == null || registrationDto.email().trim().isEmpty()) {
            throw new ValidationException("Email is required");
        }
        
        if (!isValidEmail(registrationDto.email())) {
            throw new ValidationException("Invalid email format");
        }
        
        // Password validation
        validatePassword(registrationDto.password());
    }
    
    /**
     * Validate update data.
     */
    private void validateUpdateData(UserUpdateDto updateDto) {
        if (updateDto == null) {
            throw new ValidationException("Update data cannot be null");
        }
        
        // Username validation
        if (updateDto.username() != null) {
            if (updateDto.username().trim().isEmpty()) {
                throw new ValidationException("Username cannot be empty");
            }
            if (updateDto.username().length() < 3 || updateDto.username().length() > 50) {
                throw new ValidationException("Username must be between 3 and 50 characters");
            }
        }
        
        // Email validation
        if (updateDto.email() != null) {
            if (updateDto.email().trim().isEmpty()) {
                throw new ValidationException("Email cannot be empty");
            }
            if (!isValidEmail(updateDto.email())) {
                throw new ValidationException("Invalid email format");
            }
        }
        
        // Password validation
        if (updateDto.password() != null) {
            validatePassword(updateDto.password());
        }
    }
    
    /**
     * Validate password strength.
     */
    private void validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new ValidationException("Password is required");
        }
        
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new ValidationException("Password must be at least " + MIN_PASSWORD_LENGTH + " characters long");
        }
        
        if (password.length() > MAX_PASSWORD_LENGTH) {
            throw new ValidationException("Password must not exceed " + MAX_PASSWORD_LENGTH + " characters");
        }
        
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new ValidationException(
                "Password must contain at least one lowercase letter, one uppercase letter, " +
                "one digit, and one special character (@$!%*?&)"
            );
        }
    }
    
    /**
     * Validate email format.
     */
    private boolean isValidEmail(String email) {
        String emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return Pattern.matches(emailPattern, email);
    }
}
