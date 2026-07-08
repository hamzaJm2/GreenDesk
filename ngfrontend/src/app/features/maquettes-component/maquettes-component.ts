import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockupService } from '../../services/mockup-service';
import { MockupProjectDTO } from '../../models/mockup';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-maquettes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './maquettes-component.html',
  styleUrls: ['./maquettes-component.scss']
})
export class MaquettesComponent implements OnInit {

  projects: MockupProjectDTO[] = [];
  filteredProjects: MockupProjectDTO[] = [];
  isLoading = true;
  errorMessage = '';
  searchQuery = '';
  filterStatut = 'all';
  deletingId: number | null = null;
  duplicatingId: number | null = null;

  constructor(
    private mockupService: MockupService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.mockupService.getAll().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les maquettes.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let result = [...this.projects];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.nomProjet.toLowerCase().includes(q) ||
        p.clientRef?.toLowerCase().includes(q)
      );
    }
    if (this.filterStatut !== 'all') {
      result = result.filter(p => p.statut === this.filterStatut);
    }
    this.filteredProjects = result;
    this.cdr.detectChanges();
  }

  duplicate(id: number): void {
    this.duplicatingId = id;
    this.mockupService.duplicate(id).subscribe({
      next: () => { this.duplicatingId = null; this.loadProjects(); },
      error: () => { this.duplicatingId = null; }
    });
  }

  delete(id: number): void {
    if (confirm('Supprimer cette maquette définitivement ?')) {
      this.deletingId = id;
      this.mockupService.delete(id).subscribe({
        next: () => { this.deletingId = null; this.loadProjects(); },
        error: () => { this.deletingId = null; }
      });
    }
  }

  getStatusLabel(statut: string): string {
    return statut === 'finalise' ? 'Finalisé' : 'Brouillon';
  }

  getStatusColor(statut: string): string {
    return statut === 'finalise' ? 'var(--c-green-teal)' : 'var(--c-gold)';
  }

  getStatusBg(statut: string): string {
    return statut === 'finalise' ? '#F0FDF4' : '#FFFBEB';
  }

  formatDate(date?: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  getLogoUrl(path: string): string {
    return `${environment.apiUrl}/${path}`;
  }

  get totalBrouillons(): number {
    return this.projects.filter(p => p.statut === 'brouillon').length;
  }

  get totalFinalises(): number {
    return this.projects.filter(p => p.statut === 'finalise').length;
  }

  get totalProduits(): number {
    return this.projects.reduce((sum, p) => sum + (p.produitsSelectionnes?.length ?? 0), 0);
  }

  getPrincipalLogo(project: MockupProjectDTO): any {
    if (!project.logos?.length) return null;
    return project.logos.find(l => String(l.id) === project.logoPrincipalId)
      ?? project.logos[0];
  }
}
