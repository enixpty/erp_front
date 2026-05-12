import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMenu } from './create-menu';

describe('CreateMenu', () => {
  let component: CreateMenu;
  let fixture: ComponentFixture<CreateMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
