import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddChannelComponent } from '../dialog-add-channel/add-channel.component';
import { NewMsgService } from '../new-msg.service';
import { AuthenticationService } from '../authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channel-sidebar',
  templateUrl: './channel-sidebar.component.html',
  styleUrls: ['./channel-sidebar.component.scss'],
})
export class ChannelSidebarComponent implements OnInit, OnDestroy {
  channelsVisible: boolean = true;
  dmsVisible: boolean = true;
  workspaceVisible: boolean = true;
  openNewMsg: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(public dialog: MatDialog, private newMsgService: NewMsgService, private authService: AuthenticationService) {}

  ngOnInit() {
    // Abonnieren Sie den channelList$ Observable
    this.subscriptions.add(
      this.authService.channelList$.subscribe(channels => {
        // Ihr Code zur Aktualisierung des UIs
      })
    );
  }

  ngOnDestroy() {
    // Vergessen Sie nicht, die Subscription zu beenden, wenn die Komponente zerstört wird
    this.subscriptions.unsubscribe();
  }

  toggleChannels() {
    this.channelsVisible = !this.channelsVisible;
  }

  toggleDms() {
    this.dmsVisible = !this.dmsVisible;
  }

  toggleWorkspace() {
    this.workspaceVisible = !this.workspaceVisible;
  }

  openAddChannel() {
    this.dialog.open(AddChannelComponent);
  }

  toggleNewMsgComponent() {
    this.newMsgService.toggleNewMsg();
  }
}
