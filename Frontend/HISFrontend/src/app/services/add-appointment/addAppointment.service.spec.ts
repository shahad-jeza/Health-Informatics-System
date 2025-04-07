import { TestBed } from '@angular/core/testing';

import { AddAppointmentService } from '../add-appointment/addAppointment.service';

describe('AddAppointmentService', () => {
  let service: AddAppointmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddAppointmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
