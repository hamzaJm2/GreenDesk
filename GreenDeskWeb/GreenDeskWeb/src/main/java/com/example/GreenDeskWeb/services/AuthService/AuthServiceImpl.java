package com.example.GreenDeskWeb.services.AuthService;

import com.example.GreenDeskWeb.dto.AuthResponseDTO;
import com.example.GreenDeskWeb.dto.LoginRequestDTO;
import com.example.GreenDeskWeb.dto.RegisterRequestDTO;
import com.example.GreenDeskWeb.entites.User;
import com.example.GreenDeskWeb.enums.UserRole;
import com.example.GreenDeskWeb.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return buildResponse(user, jwtService.generateToken(user));
    }

    @Override
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé");
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .role(UserRole.CLIENT)
                .actif(true)
                .build();
        userRepository.save(user);
        return buildResponse(user, jwtService.generateToken(user));
    }

    @Override
    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        return userRepository.findByEmail(principal.toString())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    private AuthResponseDTO buildResponse(User user, String token) {
        return AuthResponseDTO.builder()
                .token(token)
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole().name())
                .build();
    }
}
