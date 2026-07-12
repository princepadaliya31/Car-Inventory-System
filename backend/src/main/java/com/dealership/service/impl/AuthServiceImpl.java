package com.dealership.service.impl;

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
import com.dealership.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Override
    public MessageResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (email.equals("admin@gmail.com")) {
            throw new ConflictException("Admin registration is not allowed");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already in use");
        }

        // Enforce USER role for all standard registrations; new admin registration is disabled
        Role role = Role.USER;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return new MessageResponse("User Registered Successfully");
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        // Check for hardcoded admin credentials
        if (email.equals("admin@gmail.com")) {
            if ("admin123".equals(request.getPassword())) {
                // Seed admin user in database if it doesn't exist so relational DB lookups succeed
                if (!userRepository.existsByEmail("admin@gmail.com")) {
                    User adminUser = User.builder()
                            .name("System Administrator")
                            .email("admin@gmail.com")
                            .password(passwordEncoder.encode("admin123"))
                            .role(Role.ADMIN)
                            .createdAt(LocalDateTime.now())
                            .build();
                    userRepository.save(adminUser);
                }
                String token = tokenProvider.generateToken("admin@gmail.com", "ADMIN");
                return new LoginResponse(token, "ADMIN");
            } else {
                throw new UnauthorizedException("Invalid email or password");
            }
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return new LoginResponse(token, user.getRole().name());
    }
}
