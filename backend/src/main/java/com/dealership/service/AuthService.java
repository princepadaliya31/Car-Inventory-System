package com.dealership.service;

import com.dealership.dto.LoginRequest;
import com.dealership.dto.LoginResponse;
import com.dealership.dto.MessageResponse;
import com.dealership.dto.RegisterRequest;

public interface AuthService {
    MessageResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
}
