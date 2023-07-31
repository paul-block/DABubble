import { TestBed } from '@angular/core/testing';

import { NewMsgService } from './new-msg.service';

describe('NewMsgService', () => {
  let service: NewMsgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewMsgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
