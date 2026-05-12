import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuRoles } from './menu-roles';

describe('MenuRoles', () => {
  let component: MenuRoles;
  let fixture: ComponentFixture<MenuRoles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuRoles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuRoles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
