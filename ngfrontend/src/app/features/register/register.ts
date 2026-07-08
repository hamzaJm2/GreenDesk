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
  errorMessage: string | null = null;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password || !this.nom || !this.prenom) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.register(this.email, this.password, this.nom, this.prenom).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => {
        this.isLoading = false;
        const msg = err?.error?.error;
        this.errorMessage = msg || 'Une erreur est survenue lors de l\'inscription.';
      }
    });
  }
}
