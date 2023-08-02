import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAutocompleteComponent } from './dialog-autocomplete.component';

describe('DialogAutocompleteComponent', () => {
  let component: DialogAutocompleteComponent;
  let fixture: ComponentFixture<DialogAutocompleteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogAutocompleteComponent]
    });
    fixture = TestBed.createComponent(DialogAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
