import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ConfigOption {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface ConfigSection {
  id: string;
  title: string;
  options: ConfigOption[];
  required: boolean;
  multiple: boolean;
}

@Component({
  selector: 'app-product-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-config.html',
  styleUrl: './product-config.scss'
})
export class ProductConfig implements OnInit {
  @Input() productId: string = '1';
  @Input() basePrice: number = 149;

  // Image d'exemple unique
  productImage: string = 'https://images.unsplash.com/photo-1543512214-318c7553f230?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  // État de la configuration
  currentStep: number = 1;
  totalSteps: number = 4;
  showPreview: boolean = true;

  // Configuration du produit
  configSections: ConfigSection[] = [
    {
      id: 'color',
      title: 'Couleur',
      required: true,
      multiple: false,
      options: [
        { id: 'black', name: 'Noir mat', price: 0, available: true },
        { id: 'white', name: 'Blanc', price: 0, available: true },
        { id: 'green', name: 'Vert forêt', price: 0, available: true },
        { id: 'gold', name: 'Doré', price: 29, available: true }
      ]
    },
    {
      id: 'size',
      title: 'Taille',
      required: true,
      multiple: false,
      options: [
        { id: 'small', name: 'Petit (S)', price: 0, available: true },
        { id: 'medium', name: 'Moyen (M)', price: 29, available: true },
        { id: 'large', name: 'Grand (L)', price: 49, available: true },
        { id: 'xl', name: 'Extra large (XL)', price: 79, available: false }
      ]
    },
    {
      id: 'options',
      title: 'Options supplémentaires',
      required: false,
      multiple: true,
      options: [
        { id: 'batterie', name: 'Batterie supplémentaire', price: 39, available: true },
        { id: 'etui', name: 'Étui de protection', price: 19, available: true },
        { id: 'chargeur', name: 'Chargeur rapide', price: 29, available: true },
        { id: 'cable', name: 'Cable USB-C 2m', price: 9, available: true }
      ]
    },
    {
      id: 'personnalisation',
      title: 'Personnalisation',
      required: false,
      multiple: false,
      options: [
        { id: 'gravure', name: 'Gravure laser', price: 15, available: true },
        { id: 'emballage', name: 'Emballage cadeau', price: 5, available: true }
      ]
    }
  ];

  // Sélections de l'utilisateur
  selectedOptions: { [key: string]: string | string[] } = {
    color: 'black',
    size: 'medium',
    options: [],
    personnalisation: ""
  };

  // Prix calculé
  totalPrice: number = this.basePrice;
  additionalPrice: number = 0;

  // Texte de gravure
  gravureText: string = '';

  ngOnInit() {
    this.calculatePrice();
  }

  // Sélection d'option unique
  selectOption(sectionId: string, optionId: string): void {
    const section = this.configSections.find(s => s.id === sectionId);

    if (section?.multiple) {
      // Pour les sections multiples (checkboxes)
      const currentSelections = (this.selectedOptions[sectionId] as string[]) || [];
      if (currentSelections.includes(optionId)) {
        this.selectedOptions[sectionId] = currentSelections.filter(id => id !== optionId);
      } else {
        this.selectedOptions[sectionId] = [...currentSelections, optionId];
      }
    } else {
      // Pour les sections uniques (radio)
      this.selectedOptions[sectionId] = optionId;
    }

    this.calculatePrice();
  }

  // Vérifier si une option est sélectionnée
  isSelected(sectionId: string, optionId: string): boolean {
    const selection = this.selectedOptions[sectionId];
    if (Array.isArray(selection)) {
      return selection.includes(optionId);
    }
    return selection === optionId;
  }

  // Vérifier si une section est configurée
  isSectionConfigured(sectionId: string): boolean {
    const selection = this.selectedOptions[sectionId];
    const section = this.configSections.find(s => s.id === sectionId);

    if (!section?.required) return true;

    if (Array.isArray(selection)) {
      return selection.length > 0;
    }
    return !!selection;
  }

  // Calculer le prix total
  calculatePrice(): void {
    this.additionalPrice = 0;

    this.configSections.forEach(section => {
      const selection = this.selectedOptions[section.id];

      if (Array.isArray(selection)) {
        // Options multiples
        selection.forEach(optId => {
          const option = section.options.find(o => o.id === optId);
          if (option) this.additionalPrice += option.price;
        });
      } else if (selection) {
        // Option unique
        const option = section.options.find(o => o.id === selection);
        if (option) this.additionalPrice += option.price;
      }
    });

    this.totalPrice = this.basePrice + this.additionalPrice;
  }

  // Gestion de la gravure
  onGravureChange(event: any): void {
    this.gravureText = event.target.value;
  }

  // Navigation entre les étapes
  nextStep(): void {
    if (this.currentStep < this.totalSteps && this.validateStep(this.currentStep)) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Valider la configuration
  validateStep(step: number): boolean {
    const section = this.configSections[step - 1];
    if (!section.required) return true;

    const selection = this.selectedOptions[section.id];
    if (Array.isArray(selection)) {
      return selection.length > 0;
    }
    return !!selection;
  }

  // Soumettre la configuration
  submitConfiguration(): void {
    console.log('Configuration soumise:', {
      productId: this.productId,
      selections: this.selectedOptions,
      gravureText: this.gravureText,
      totalPrice: this.totalPrice
    });
    // Ici vous pouvez rediriger vers la page de devis
    alert('Votre demande de devis a été envoyée !');
  }

  // Réinitialiser la configuration
  resetConfig(): void {
    this.selectedOptions = {
      color: 'black',
      size: 'medium',
      options: [],
      personnalisation: ""
    };
    this.gravureText = '';
    this.currentStep = 1;
    this.calculatePrice();
  }
}
