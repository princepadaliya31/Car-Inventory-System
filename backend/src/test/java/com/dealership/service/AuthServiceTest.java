package com.dealership.service;

import com.dealership.dto.LoginRequest;
import com.dealership.dto.LoginResponse;
import com.dealership.dto.MessageResponse;
import com.dealership.dto.RegisterRequest;
import com.dealership.exception.ConflictException;
import com.dealership.exception.UnauthorizedException;
import com.dealership.model.Role;
import com.dealership.model.User;
import com.dealership.repository.UserRepository;
import com.dealership.security.JwtTokenProvider;
import com.dealership.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(userRepository, passwordEncoder, tokenProvider);
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest("Alice", "alice@example.com", "password123");
        
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        
        MessageResponse response = authService.register(request);
        
        assertNotNull(response);
        assertEquals("User Registered Successfully", response.getMessage());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_ThrowsConflictException_ForDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Alice", "alice@example.com", "password123");
        
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);
        
        assertThrows(ConflictException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest("alice@example.com", "password123");
        User user = User.builder()
                .email("alice@example.com")
                .password("encodedPassword")
                .role(Role.USER)
                .build();
        
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);
        when(tokenProvider.generateToken(user.getEmail(), "USER")).thenReturn("mockedToken");
        
        LoginResponse response = authService.login(request);
        
        assertNotNull(response);
        assertEquals("mockedToken", response.getToken());
        assertEquals("USER", response.getRole());
    }

    @Test
    void login_ThrowsUnauthorizedException_ForInvalidPassword() {
        LoginRequest request = new LoginRequest("alice@example.com", "wrongPassword");
        User user = User.builder()
                .email("alice@example.com")
                .password("encodedPassword")
                .role(Role.USER)
                .build();
        
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(false);
        
        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }
}
