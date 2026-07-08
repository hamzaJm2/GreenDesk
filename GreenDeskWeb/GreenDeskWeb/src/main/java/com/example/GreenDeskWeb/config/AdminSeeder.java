package com.example.GreenDeskWeb.config;

import com.example.GreenDeskWeb.entites.User;
import com.example.GreenDeskWeb.enums.UserRole;
import com.example.GreenDeskWeb.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@admin.com";
    private static final String ADMIN_PASSWORD = "Admin123!";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            return;
        }
        User admin = User.builder()
                .email(ADMIN_EMAIL)
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .nom("Admin")
                .prenom("Test")
                .role(UserRole.ADMIN)
                .actif(true)
                .build();
        userRepository.save(admin);
    }
}
