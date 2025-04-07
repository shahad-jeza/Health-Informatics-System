import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorSummaryComponent } from './doctor-summary.component';

describe('DoctorSummaryComponent', () => {
  let component: DoctorSummaryComponent;
  let fixture: ComponentFixture<DoctorSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
