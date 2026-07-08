package com.example.GreenDeskWeb.dto;

import lombok.Data;

@Data
public class RegisterRequestDTO {
    private String email;
    private String password;
    private String nom;
    private String prenom;
}
