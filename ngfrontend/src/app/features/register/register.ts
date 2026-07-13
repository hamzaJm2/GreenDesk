import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html'
})
export class RegisterComponent {
  email = '';
  password = '';
  nom = '';
  prenom = '';
  societe = '';
  siret = '';
  certifie = false;
  errorMessage: string | null = null;
  showPopup = false;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password || !this.nom ||
      !this.prenom || !this.societe || !this.siret) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }
    if (!/^\d{14}$/.test(this.siret)) {
      this.errorMessage = 'Le SIRET doit contenir exactement 14 chiffres.';
      return;
    }
    if (!this.certifie) {
      this.errorMessage = 'Vous devez cocher la case de certification.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.register(
      this.email, this.password, this.nom,
      this.prenom, this.societe, this.siret
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.showPopup = true;
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err?.error?.error ||
          'Une erreur est survenue lors de l\'inscription.';
      }
    });
  }

  fermerPopup(): void {
    this.showPopup = false;
    this.router.navigate(['/login']);
  }
}
