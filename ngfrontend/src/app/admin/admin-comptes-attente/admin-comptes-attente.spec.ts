import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComptesAttente } from './admin-comptes-attente';

describe('AdminComptesAttente', () => {
  let component: AdminComptesAttente;
  let fixture: ComponentFixture<AdminComptesAttente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComptesAttente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminComptesAttente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
