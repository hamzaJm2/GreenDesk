package com.example.GreenDeskWeb.services.AuthService;

import com.example.GreenDeskWeb.dto.AuthResponseDTO;
import com.example.GreenDeskWeb.dto.LoginRequestDTO;
import com.example.GreenDeskWeb.dto.RegisterRequestDTO;
import com.example.GreenDeskWeb.entites.User;

public interface AuthService {
    AuthResponseDTO login(LoginRequestDTO request);
    AuthResponseDTO register(RegisterRequestDTO request);
    User getCurrentUser();
}
