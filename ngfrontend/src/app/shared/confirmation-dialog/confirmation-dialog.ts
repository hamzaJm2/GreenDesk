import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.html',
  styleUrls: ['./confirmation-dialog.scss']
})
export class ConfirmationDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Êtes-vous sûr ?';
  @Input() itemName: string = '';
  @Input() confirmText: string = 'Confirmer';
  @Input() cancelText: string = 'Annuler';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
