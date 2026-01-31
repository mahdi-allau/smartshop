import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarrelloComponent } from './carrello';

describe('CarrelloComponent', () => {
  let component: CarrelloComponent;
  let fixture: ComponentFixture<CarrelloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarrelloComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarrelloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
