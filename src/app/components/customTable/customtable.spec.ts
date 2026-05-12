import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Customtable } from './customtable';

describe('Customtable', () => {
  let component: Customtable;
  let fixture: ComponentFixture<Customtable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Customtable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Customtable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
