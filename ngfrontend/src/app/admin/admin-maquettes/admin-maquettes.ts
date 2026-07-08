import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MockupService } from '../../services/mockup-service';
import { MockupProjectDTO } from '../../models/mockup';

@Component({
  selector: 'app-admin-maquettes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-maquettes.html'
})
export class AdminMaquettesComponent implements OnInit {

  projects: MockupProjectDTO[] = [];
  filtered: MockupProjectDTO[] = [];
  searchQuery = '';
  isLoading = true;

  constructor(
    private mockupService: MockupService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.mockupService.getAll().subscribe({
      next: data => {
        this.projects = data;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filtered = this.projects;
      return;
    }
    this.filtered = this.projects.filter(p => {
      const client = `${p.ownerPrenom ?? ''} ${p.ownerNom ?? ''} ${p.ownerEmail ?? ''}`.toLowerCase();
      return client.includes(q) || (p.nomProjet ?? '').toLowerCase().includes(q);
    });
  }

  getClientLabel(p: MockupProjectDTO): string {
    if (p.ownerPrenom || p.ownerNom) {
      return `${p.ownerPrenom ?? ''} ${p.ownerNom ?? ''}`.trim();
    }
    return p.ownerEmail ?? '—';
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
