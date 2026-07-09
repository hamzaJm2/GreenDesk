package com.example.GreenDeskWeb.controllers;

import com.example.GreenDeskWeb.entites.User;
import com.example.GreenDeskWeb.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    // ── Liste comptes en attente ──────────────────────────────────
    @GetMapping("/comptes-attente")
    public ResponseEntity<List<User>> getComptesEnAttente() {
        List<User> comptes = userRepository
                .findByStatutCompte(User.StatutCompte.EN_ATTENTE);
        return ResponseEntity.ok(comptes);
    }

    // ── Valider un compte ─────────────────────────────────────────
    @PostMapping("/comptes/{id}/valider")
    public ResponseEntity<Map<String, String>> valider(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setStatutCompte(User.StatutCompte.ACTIF);
        user.setActif(true);
        userRepository.save(user);

        // Email à l'utilisateur
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(user.getEmail());
            mail.setSubject("Votre compte GreenDesk est activé ✅");
            mail.setText(
                    "Bonjour " + user.getPrenom() + ",\n\n" +
                            "Votre compte GreenDesk a été validé. " +
                            "Vous pouvez maintenant vous connecter.\n\n" +
                            "Accéder à GreenDesk : http://localhost:4200/login\n\n" +
                            "Bienvenue,\nL'équipe GreenDesk"
            );
            mailSender.send(mail);
        } catch (Exception e) {
            System.err.println("Erreur email validation : " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Compte validé avec succès"));
    }

    // ── Refuser un compte ─────────────────────────────────────────
    @PostMapping("/comptes/{id}/refuser")
    public ResponseEntity<Map<String, String>> refuser(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String motif = body.getOrDefault("motif", "");

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setStatutCompte(User.StatutCompte.REFUSE);
        user.setMotifRefus(motif);
        userRepository.save(user);

        // Email à l'utilisateur
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(user.getEmail());
            mail.setSubject("Votre demande de compte GreenDesk");
            mail.setText(
                    "Bonjour " + user.getPrenom() + ",\n\n" +
                            "Votre demande de compte GreenDesk a été refusée.\n\n" +
                            "Motif : " + motif + "\n\n" +
                            "Pour toute question : contact@greendesk.fr\n\n" +
                            "Cordialement,\nL'équipe GreenDesk"
            );
            mailSender.send(mail);
        } catch (Exception e) {
            System.err.println("Erreur email refus : " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Compte refusé"));
    }
}