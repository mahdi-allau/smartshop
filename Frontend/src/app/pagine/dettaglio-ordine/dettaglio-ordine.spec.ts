import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DettaglioOrdine } from './dettaglio-ordine';

describe('DettaglioOrdine', () => {
  let component: DettaglioOrdine;
  let fixture: ComponentFixture<DettaglioOrdine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DettaglioOrdine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DettaglioOrdine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
