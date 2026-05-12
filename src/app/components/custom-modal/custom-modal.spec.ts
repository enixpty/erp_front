import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomModal } from './custom-modal';

describe('CustomModal', () => {
  let component: CustomModal;
  let fixture: ComponentFixture<CustomModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
