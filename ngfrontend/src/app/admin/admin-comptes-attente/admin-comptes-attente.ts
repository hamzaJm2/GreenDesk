import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface CompteAttente {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  societe: string;
  siret: string;
}

@Component({
  selector: 'app-admin-comptes-attente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-comptes-attente.html'
})
export class AdminComptesAttenteComponent implements OnInit {

  comptes: CompteAttente[] = [];
  loading = true;
  motifRefus: Record<number, string> = {};
  showMotifFor: number | null = null;
  actionLoading: number | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.chargerComptes();
  }

  chargerComptes(): void {
    this.loading = true;
    const headers = this.getHeaders();
    this.http.get<CompteAttente[]>(
      `${this.apiUrl}/admin/comptes-attente`, { headers }
    ).subscribe({
      next: data => {
        this.comptes = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Erreur lors du chargement des comptes.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  valider(id: number): void {
    this.actionLoading = id;
    const headers = this.getHeaders();
    this.http.post(
      `${this.apiUrl}/admin/comptes/${id}/valider`, {}, { headers }
    ).subscribe({
      next: () => {
        this.comptes = this.comptes.filter(c => c.id !== id);
        this.actionLoading = null;
        this.successMessage = 'Compte validé — email envoyé à l\'utilisateur.';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = null; this.cdr.detectChanges(); }, 3000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la validation.';
        this.actionLoading = null;
        this.cdr.detectChanges();
      }
    });
  }

  ouvrirRefus(id: number): void {
    this.showMotifFor = id;
    this.motifRefus[id] = '';
    this.cdr.detectChanges();
  }

  refuser(id: number): void {
    const motif = this.motifRefus[id]?.trim();
    if (!motif) {
      this.errorMessage = 'Le motif de refus est obligatoire.';
      this.cdr.detectChanges();
      return;
    }
    this.actionLoading = id;
    const headers = this.getHeaders();
    this.http.post(
      `${this.apiUrl}/admin/comptes/${id}/refuser`,
      { motif }, { headers }
    ).subscribe({
      next: () => {
        this.comptes = this.comptes.filter(c => c.id !== id);
        this.showMotifFor = null;
        this.actionLoading = null;
        this.successMessage = 'Compte refusé — email envoyé à l\'utilisateur.';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = null; this.cdr.detectChanges(); }, 3000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors du refus.';
        this.actionLoading = null;
        this.cdr.detectChanges();
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('greendesk_jwt');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
