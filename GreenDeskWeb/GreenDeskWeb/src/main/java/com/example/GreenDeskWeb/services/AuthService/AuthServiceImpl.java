package com.example.GreenDeskWeb.services.AuthService;

import com.example.GreenDeskWeb.dto.AuthResponseDTO;
import com.example.GreenDeskWeb.dto.LoginRequestDTO;
import com.example.GreenDeskWeb.dto.RegisterRequestDTO;
import com.example.GreenDeskWeb.entites.User;
import com.example.GreenDeskWeb.enums.UserRole;
import com.example.GreenDeskWeb.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
    private final JavaMailSender mailSender;

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérification statut compte
        if (user.getStatutCompte() == User.StatutCompte.EN_ATTENTE) {
            throw new RuntimeException("COMPTE_EN_ATTENTE");
        }
        if (user.getStatutCompte() == User.StatutCompte.REFUSE) {
            throw new RuntimeException("COMPTE_REFUSE:" + user.getMotifRefus());
        }

        return buildResponse(user, jwtService.generateToken(user));
    }

    @Override
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé");
        }

        // Validation SIRET format 14 chiffres
        if (request.getSiret() == null || !request.getSiret().matches("\\d{14}")) {
            throw new IllegalArgumentException("Le SIRET doit contenir 14 chiffres");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .societe(request.getSociete())
                .siret(request.getSiret())
                .role(UserRole.CLIENT)
                .actif(false)
                .statutCompte(User.StatutCompte.EN_ATTENTE)
                .build();

        userRepository.save(user);

        // Email aux validateurs
        envoyerEmailValidateurs(user);

        return AuthResponseDTO.builder()
                .message("Votre demande a été envoyée. Vous recevrez un email dès validation de votre compte.")
                .statutCompte("EN_ATTENTE")
                .build();
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

    private void envoyerEmailValidateurs(User user) {
        String[] validateurs = {
                "hamza@yopmail.com"
        };

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(validateurs);
        mail.setSubject("Nouvelle demande de compte GreenDesk — " + user.getSociete());
        mail.setText(
                "Une nouvelle demande de compte a été reçue :\n\n" +
                        "Nom : " + user.getNom() + " " + user.getPrenom() + "\n" +
                        "Email : " + user.getEmail() + "\n" +
                        "Société : " + user.getSociete() + "\n" +
                        "SIRET : " + user.getSiret() + "\n\n" +
                        "Valider ou refuser le compte ici :\n" +
                        "http://localhost:4200/admin/comptes-attente"
        );

        try {
            mailSender.send(mail);
        } catch (Exception e) {
            // Log l'erreur sans bloquer l'inscription
            System.err.println("Erreur envoi email validateurs : " + e.getMessage());
        }
    }

    private AuthResponseDTO buildResponse(User user, String token) {
        return AuthResponseDTO.builder()
                .token(token)
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole().name())
                .statutCompte(user.getStatutCompte().name())
                .build();
    }
}