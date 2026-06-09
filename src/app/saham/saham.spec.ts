import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Saham } from './saham';

describe('Saham', () => {
  let component: Saham;
  let fixture: ComponentFixture<Saham>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Saham],
    }).compileComponents();

    fixture = TestBed.createComponent(Saham);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
