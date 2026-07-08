import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {IconRule, IconRuleService} from '../../services/icon-rule-service';


@Component({
  selector: 'app-admin-icones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-icones.html',
  styleUrls: ['./admin-icones.scss']
})
export class AdminIcones implements OnInit {

  rules: IconRule[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Formulaire création/édition
  editingRule: IconRule | null = null;
  isCreating = false;

  form: IconRule = { label: '', iconId: '', keywords: [] };
  newKeyword = '';

  // Test icône
  testText = '';
  testResult: { iconId: string } | null = null;

  deletingId: number | null = null;

  constructor(
    private iconRuleService: IconRuleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.isLoading = true;
    this.iconRuleService.getAll().subscribe({
      next: (rules :any) => {
        this.rules = rules;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les règles.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  startCreate(): void {
    this.isCreating = true;
    this.editingRule = null;
    this.form = { label: '', iconId: '', keywords: [] };
    this.newKeyword = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  startEdit(rule: IconRule): void {
    this.editingRule = rule;
    this.isCreating = false;
    this.form = { ...rule, keywords: [...rule.keywords] };
    this.newKeyword = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelForm(): void {
    this.isCreating = false;
    this.editingRule = null;
    this.form = { label: '', iconId: '', keywords: [] };
    this.newKeyword = '';
  }

  addKeyword(): void {
    const kw = this.newKeyword.trim().toLowerCase();
    if (!kw || this.form.keywords.includes(kw)) return;
    this.form.keywords.push(kw);
    this.newKeyword = '';
  }

  removeKeyword(index: number): void {
    this.form.keywords.splice(index, 1);
  }

  save(): void {
    if (!this.form.label.trim() || !this.form.iconId.trim()) {
      this.errorMessage = 'Label et identifiant icône sont obligatoires.';
      return;
    }

    if (this.isCreating) {
      this.iconRuleService.create(this.form).subscribe({
        next: () => {
          this.successMessage = 'Règle créée !';
          this.cancelForm();
          this.loadRules();
        },
        error: () => { this.errorMessage = 'Erreur lors de la création.'; this.cdr.detectChanges(); }
      });
    } else if (this.editingRule?.id) {
      this.iconRuleService.update(this.editingRule.id, this.form).subscribe({
        next: () => {
          this.successMessage = 'Règle mise à jour !';
          this.cancelForm();
          this.loadRules();
        },
        error: () => { this.errorMessage = 'Erreur lors de la mise à jour.'; this.cdr.detectChanges(); }
      });
    }
  }

  delete(id: number): void {
    if (!confirm('Supprimer cette règle ?')) return;
    this.deletingId = id;
    this.iconRuleService.delete(id).subscribe({
      next: () => { this.deletingId = null; this.loadRules(); },
      error: () => { this.deletingId = null; this.cdr.detectChanges(); }
    });
  }

  testIconResolution(): void {
    if (!this.testText.trim()) return;
    this.iconRuleService.resolve(this.testText).subscribe({
      next: (res :any) => { this.testResult = res; this.cdr.detectChanges(); },
      error: () => { this.testResult = null; }
    });
  }

  onKeywordKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addKeyword(); }
  }
}
