import { TestBed } from '@angular/core/testing';

import { ChannelDirectchatService } from './directchat.service';

describe('ChannelDirectchatService', () => {
  let service: ChannelDirectchatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelDirectchatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
