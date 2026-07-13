import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlacementState } from '../models/placement';

export interface DraftZoneElement {
  elementId: string;
  logoId: number | null;
  placement: PlacementState;
  touched: boolean;
  label: string;
}

export interface DraftZonePlacement {
  zoneId: number;
  activeElementId: string | null;
  touched: boolean;
  elements: DraftZoneElement[];
}

export interface DraftVariant {
  variantId: string;
  label: string;
  activeZoneId: number | null;
  zonePlacements: DraftZonePlacement[];
}

export interface DraftColorisCustomization {
  colorisId: number;
  activeVariantId: string;
  selectedColor?: string;
  variants: DraftVariant[];
}

export interface DraftProductCustomization {
  productId: number;
  activeColorisId: number | null;
  validated: boolean;
  colorisCustomizations: DraftColorisCustomization[];
}

export interface MaquetteDraftState {
  projectId: number;
  currentStep: number;
  selectedColoris: Record<number, number[]>;
  activeProductId: number | null;
  customizations: DraftProductCustomization[];
}

/**
 * Persiste l'état de paramétrage (étapes 2/3 du générateur de maquettes) côté client
 * uniquement, pour survivre à un retour en arrière ou à un F5 pendant la session.
 * Ne contient que des identifiants/placements — les métadonnées (nom, image, masque…)
 * sont réhydratées depuis les caches du composant au chargement.
 */
@Injectable({ providedIn: 'root' })
export class MaquetteDraftStateService {
  private readonly storagePrefix = 'greendesk_maquette_draft_';
  private stateSubject = new BehaviorSubject<MaquetteDraftState | null>(null);
  state$ = this.stateSubject.asObservable();

  save(state: MaquetteDraftState): void {
    this.stateSubject.next(state);
    try {
      sessionStorage.setItem(this.key(state.projectId), JSON.stringify(state));
    } catch {
      // sessionStorage indisponible (navigation privée, quota…) : on continue sans persistance.
    }
  }

  load(projectId: number): MaquetteDraftState | null {
    try {
      const raw = sessionStorage.getItem(this.key(projectId));
      if (!raw) return null;
      const state = JSON.parse(raw) as MaquetteDraftState;
      this.stateSubject.next(state);
      return state;
    } catch {
      return null;
    }
  }

  clear(projectId: number): void {
    try {
      sessionStorage.removeItem(this.key(projectId));
    } catch {}
    this.stateSubject.next(null);
  }

  private key(projectId: number): string {
    return `${this.storagePrefix}${projectId}`;
  }
}
