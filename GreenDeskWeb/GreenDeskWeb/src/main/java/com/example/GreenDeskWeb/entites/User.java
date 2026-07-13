package com.example.GreenDeskWeb.entites;

import com.example.GreenDeskWeb.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "app_user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private String nom;
    private String prenom;
    private String societe;
    private String siret;

    @Builder.Default
    private boolean actif = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_compte")
    @Builder.Default
    private StatutCompte statutCompte = StatutCompte.EN_ATTENTE;

    @Column(columnDefinition = "TEXT")
    private String motifRefus;


    public enum StatutCompte {
        EN_ATTENTE,
        ACTIF,
        REFUSE;

        @com.fasterxml.jackson.annotation.JsonCreator
        public static StatutCompte fromValue(String value) {
            for (StatutCompte s : values()) {
                if (s.name().equalsIgnoreCase(value)) return s;
            }
            throw new IllegalArgumentException("No enum constant: " + value);
        }
    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isEnabled() { return actif; }
}