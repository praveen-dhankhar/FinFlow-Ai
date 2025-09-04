package com.financeapp.service;

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
import com.financeapp.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserService.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private UserMapper userMapper;
    
    @InjectMocks
    private UserServiceImpl userService;
    
    private User testUser;
    private UserRegistrationDto registrationDto;
    private UserResponseDto responseDto;
    private UserUpdateDto updateDto;
    
    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("encodedPassword");
        testUser.setCreatedAt(OffsetDateTime.now());
        testUser.setUpdatedAt(OffsetDateTime.now());
        
        // Set ID using reflection since it's @GeneratedValue
        setId(testUser, 1L);
        
        registrationDto = new UserRegistrationDto(
            "testuser",
            "test@example.com",
            "Password123!"
        );
        
        responseDto = new UserResponseDto(
            1L,
            "testuser",
            "test@example.com",
            OffsetDateTime.now(),
            OffsetDateTime.now()
        );
        
        updateDto = new UserUpdateDto(
            "updateduser",
            "updated@example.com",
            "NewPassword123!"
        );
    }
    
    @Test
    @DisplayName("Should register user successfully")
    void registerUser_Success() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("encodedPassword");
        when(userMapper.toEntity(registrationDto)).thenReturn(testUser);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toResponseDto(testUser)).thenReturn(responseDto);
        
        // When
        UserResponseDto result = userService.registerUser(registrationDto);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.username()).isEqualTo("testuser");
        assertThat(result.email()).isEqualTo("test@example.com");
        
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository).existsByEmail("test@example.com");
        verify(passwordEncoder).encode("Password123!");
        verify(userRepository).save(testUser);
        verify(userMapper).toResponseDto(testUser);
    }
    
    @Test
    @DisplayName("Should throw UserAlreadyExistsException when username exists")
    void registerUser_UsernameExists_ThrowsException() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> userService.registerUser(registrationDto))
            .isInstanceOf(UserAlreadyExistsException.class)
            .hasMessage("User already exists with username: testuser");
        
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }
    
    @Test
    @DisplayName("Should throw UserAlreadyExistsException when email exists")
    void registerUser_EmailExists_ThrowsException() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> userService.registerUser(registrationDto))
            .isInstanceOf(UserAlreadyExistsException.class)
            .hasMessage("User already exists with email: test@example.com");
        
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }
    
    @Test
    @DisplayName("Should throw ValidationException for weak password")
    void registerUser_WeakPassword_ThrowsException() {
        // Given
        UserRegistrationDto weakPasswordDto = new UserRegistrationDto(
            "testuser",
            "test@example.com",
            "weak"
        );
        
        // When & Then
        assertThatThrownBy(() -> userService.registerUser(weakPasswordDto))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("Password must be at least 8 characters long");
    }
    
    @Test
    @DisplayName("Should throw ValidationException for invalid email")
    void registerUser_InvalidEmail_ThrowsException() {
        // Given
        UserRegistrationDto invalidEmailDto = new UserRegistrationDto(
            "testuser",
            "invalid-email",
            "Password123!"
        );
        
        // When & Then
        assertThatThrownBy(() -> userService.registerUser(invalidEmailDto))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("Invalid email format");
    }
    
    @Test
    @DisplayName("Should find user by ID successfully")
    void findById_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userMapper.toResponseDto(testUser)).thenReturn(responseDto);
        
        // When
        UserResponseDto result = userService.findById(1L);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.username()).isEqualTo("testuser");
        
        verify(userRepository).findById(1L);
        verify(userMapper).toResponseDto(testUser);
    }
    
    @Test
    @DisplayName("Should throw UserNotFoundException when user not found by ID")
    void findById_UserNotFound_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        
        // When & Then
        assertThatThrownBy(() -> userService.findById(1L))
            .isInstanceOf(UserNotFoundException.class)
            .hasMessage("User not found with ID: 1");
        
        verify(userRepository).findById(1L);
    }
    
    @Test
    @DisplayName("Should find user by username successfully")
    void findByUsername_Success() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userMapper.toResponseDto(testUser)).thenReturn(responseDto);
        
        // When
        UserResponseDto result = userService.findByUsername("testuser");
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.username()).isEqualTo("testuser");
        
        verify(userRepository).findByUsername("testuser");
        verify(userMapper).toResponseDto(testUser);
    }
    
    @Test
    @DisplayName("Should find user by email successfully")
    void findByEmail_Success() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userMapper.toResponseDto(testUser)).thenReturn(responseDto);
        
        // When
        UserResponseDto result = userService.findByEmail("test@example.com");
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo("test@example.com");
        
        verify(userRepository).findByEmail("test@example.com");
        verify(userMapper).toResponseDto(testUser);
    }
    
    @Test
    @DisplayName("Should update user successfully")
    void updateUser_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("updateduser")).thenReturn(false);
        when(userRepository.existsByEmail("updated@example.com")).thenReturn(false);
        when(userRepository.save(testUser)).thenReturn(testUser);
        when(userMapper.toResponseDto(testUser)).thenReturn(responseDto);
        
        // When
        UserResponseDto result = userService.updateUser(1L, updateDto);
        
        // Then
        assertThat(result).isNotNull();
        
        verify(userRepository).findById(1L);
        verify(userRepository).existsByUsername("updateduser");
        verify(userRepository).existsByEmail("updated@example.com");
        verify(userRepository).save(testUser);
        verify(userMapper).updateEntity(testUser, updateDto);
    }
    
    @Test
    @DisplayName("Should throw UserNotFoundException when updating non-existent user")
    void updateUser_UserNotFound_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        
        // When & Then
        assertThatThrownBy(() -> userService.updateUser(1L, updateDto))
            .isInstanceOf(UserNotFoundException.class)
            .hasMessage("User not found with ID: 1");
        
        verify(userRepository).findById(1L);
        verify(userRepository, never()).save(any(User.class));
    }
    
    @Test
    @DisplayName("Should throw UserAlreadyExistsException when username already exists during update")
    void updateUser_UsernameExists_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("updateduser")).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> userService.updateUser(1L, updateDto))
            .isInstanceOf(UserAlreadyExistsException.class)
            .hasMessage("User already exists with username: updateduser");
        
        verify(userRepository).findById(1L);
        verify(userRepository).existsByUsername("updateduser");
        verify(userRepository, never()).save(any(User.class));
    }
    
    @Test
    @DisplayName("Should update password successfully")
    void updatePassword_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("currentPassword", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.matches("NewPassword123!", "encodedPassword")).thenReturn(false);
        when(passwordEncoder.encode("NewPassword123!")).thenReturn("newEncodedPassword");
        when(userRepository.save(testUser)).thenReturn(testUser);
        
        // When
        userService.updatePassword(1L, "currentPassword", "NewPassword123!");
        
        // Then
        verify(userRepository).findById(1L);
        verify(passwordEncoder).matches("currentPassword", "encodedPassword");
        verify(passwordEncoder).matches("NewPassword123!", "encodedPassword");
        verify(passwordEncoder).encode("NewPassword123!");
        verify(userRepository).save(testUser);
        assertThat(testUser.getPasswordHash()).isEqualTo("newEncodedPassword");
    }
    
    @Test
    @DisplayName("Should throw InvalidPasswordException for incorrect current password")
    void updatePassword_IncorrectCurrentPassword_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);
        
        // When & Then
        assertThatThrownBy(() -> userService.updatePassword(1L, "wrongPassword", "NewPassword123!"))
            .isInstanceOf(InvalidPasswordException.class)
            .hasMessage("Incorrect password provided");
        
        verify(userRepository).findById(1L);
        verify(passwordEncoder).matches("wrongPassword", "encodedPassword");
        verify(userRepository, never()).save(any(User.class));
    }
    
    @Test
    @DisplayName("Should throw InvalidPasswordException when new password same as current")
    void updatePassword_SamePassword_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("currentPassword", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.matches("NewPassword123!", "encodedPassword")).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> userService.updatePassword(1L, "currentPassword", "NewPassword123!"))
            .isInstanceOf(InvalidPasswordException.class)
            .hasMessage("New password must be different from current password");
        
        verify(userRepository).findById(1L);
        verify(passwordEncoder).matches("currentPassword", "encodedPassword");
        verify(passwordEncoder).matches("NewPassword123!", "encodedPassword");
        verify(userRepository, never()).save(any(User.class));
    }
    
    @Test
    @DisplayName("Should delete user successfully")
    void deleteUser_Success() {
        // Given
        when(userRepository.existsById(1L)).thenReturn(true);
        
        // When
        userService.deleteUser(1L);
        
        // Then
        verify(userRepository).existsById(1L);
        verify(userRepository).deleteById(1L);
    }
    
    @Test
    @DisplayName("Should throw UserNotFoundException when deleting non-existent user")
    void deleteUser_UserNotFound_ThrowsException() {
        // Given
        when(userRepository.existsById(1L)).thenReturn(false);
        
        // When & Then
        assertThatThrownBy(() -> userService.deleteUser(1L))
            .isInstanceOf(UserNotFoundException.class)
            .hasMessage("User not found with ID: 1");
        
        verify(userRepository).existsById(1L);
        verify(userRepository, never()).deleteById(anyLong());
    }
    
    @Test
    @DisplayName("Should check username existence")
    void existsByUsername_ReturnsTrue() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(true);
        
        // When
        boolean exists = userService.existsByUsername("testuser");
        
        // Then
        assertThat(exists).isTrue();
        verify(userRepository).existsByUsername("testuser");
    }
    
    @Test
    @DisplayName("Should check email existence")
    void existsByEmail_ReturnsTrue() {
        // Given
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);
        
        // When
        boolean exists = userService.existsByEmail("test@example.com");
        
        // Then
        assertThat(exists).isTrue();
        verify(userRepository).existsByEmail("test@example.com");
    }
    
    @Test
    @DisplayName("Should authenticate user successfully")
    void authenticate_Success() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(userMapper.toResponseDto(testUser)).thenReturn(responseDto);
        
        // When
        UserResponseDto result = userService.authenticate("testuser", "password");
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.username()).isEqualTo("testuser");
        
        verify(userRepository).findByUsername("testuser");
        verify(passwordEncoder).matches("password", "encodedPassword");
        verify(userMapper).toResponseDto(testUser);
    }
    
    @Test
    @DisplayName("Should throw InvalidPasswordException for incorrect password during authentication")
    void authenticate_IncorrectPassword_ThrowsException() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);
        
        // When & Then
        assertThatThrownBy(() -> userService.authenticate("testuser", "wrongPassword"))
            .isInstanceOf(InvalidPasswordException.class)
            .hasMessage("Incorrect password provided");
        
        verify(userRepository).findByUsername("testuser");
        verify(passwordEncoder).matches("wrongPassword", "encodedPassword");
    }
    
    @Test
    @DisplayName("Should get user entity successfully")
    void getUserEntity_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        
        // When
        User result = userService.getUserEntity(1L);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUsername()).isEqualTo("testuser");
        
        verify(userRepository).findById(1L);
    }
    
    @Test
    @DisplayName("Should throw ValidationException for null registration data")
    void registerUser_NullData_ThrowsException() {
        // When & Then
        assertThatThrownBy(() -> userService.registerUser(null))
            .isInstanceOf(NullPointerException.class);
    }
    
    @Test
    @DisplayName("Should throw UserNotFoundException for null update data")
    void updateUser_NullData_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        
        // When & Then
        assertThatThrownBy(() -> userService.updateUser(1L, null))
            .isInstanceOf(UserNotFoundException.class)
            .hasMessage("User not found with ID: 1");
    }
    
    @Test
    @DisplayName("Should handle empty username in registration")
    void registerUser_EmptyUsername_ThrowsException() {
        // Given
        UserRegistrationDto emptyUsernameDto = new UserRegistrationDto(
            "",
            "test@example.com",
            "Password123!"
        );
        
        // When & Then
        assertThatThrownBy(() -> userService.registerUser(emptyUsernameDto))
            .isInstanceOf(ValidationException.class)
            .hasMessage("Username is required");
    }
    
    @Test
    @DisplayName("Should handle empty email in registration")
    void registerUser_EmptyEmail_ThrowsException() {
        // Given
        UserRegistrationDto emptyEmailDto = new UserRegistrationDto(
            "testuser",
            "",
            "Password123!"
        );
        
        // When & Then
        assertThatThrownBy(() -> userService.registerUser(emptyEmailDto))
            .isInstanceOf(ValidationException.class)
            .hasMessage("Email is required");
    }
    
    @Test
    @DisplayName("Should handle null password in registration")
    void registerUser_NullPassword_ThrowsException() {
        // Given
        UserRegistrationDto nullPasswordDto = new UserRegistrationDto(
            "testuser",
            "test@example.com",
            null
        );
        
        // When & Then
        assertThatThrownBy(() -> userService.registerUser(nullPasswordDto))
            .isInstanceOf(ValidationException.class)
            .hasMessage("Password is required");
    }
    
    /**
     * Helper method to set ID using reflection since entities use @GeneratedValue.
     */
    private void setId(Object entity, Long id) {
        try {
            Field idField = entity.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(entity, id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set ID using reflection", e);
        }
    }
}
