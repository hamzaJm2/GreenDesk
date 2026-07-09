package com.example.GreenDeskWeb.controllers;

import com.example.GreenDeskWeb.dto.AuthResponseDTO;
import com.example.GreenDeskWeb.dto.LoginRequestDTO;
import com.example.GreenDeskWeb.dto.RegisterRequestDTO;
import com.example.GreenDeskWeb.entites.User;
import com.example.GreenDeskWeb.services.AuthService.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "nom", user.getNom() != null ? user.getNom() : "",
                "prenom", user.getPrenom() != null ? user.getPrenom() : "",
                "role", user.getRole().name()
        ));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Email ou mot de passe incorrect"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException e) {
        String msg = e.getMessage();
        if (msg != null && msg.startsWith("COMPTE_EN_ATTENTE")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "COMPTE_EN_ATTENTE"));
        }
        if (msg != null && msg.startsWith("COMPTE_REFUSE:")) {
            String motif = msg.substring("COMPTE_REFUSE:".length());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "COMPTE_REFUSE", "motif", motif));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", msg != null ? msg : "Erreur serveur"));
    }
}
