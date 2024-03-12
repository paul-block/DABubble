import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProfileMenuComponent } from '../profile-menu/profile-menu.component';
import { ChatService } from 'services/chat.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
import { AuthenticationService } from 'services/authentication.service';

@Component({
  selector: 'app-desktop-header',
  templateUrl: './desktop-header.component.html',
  styleUrls: ['./desktop-header.component.scss']
})
export class DesktopHeaderComponent {

  constructor(
    public authService: AuthenticationService,
    private dialog: MatDialog,
    public chatService: ChatService,
    public genFuncService: GeneralFunctionsService,
  ) { }
  /**
   * Opens the profile menu, setting the position based on the element's bounds and screen width.
   * Listens for the dialog's close event and handles the cleanup.
   */
  openProfileMenu() {
    const dialogConfig = new MatDialogConfig();
    this.checkMobileOrDesktopVersion(dialogConfig);
    this.dialog.open(ProfileMenuComponent, dialogConfig);
  }

  /**
  * Checks if the screen width corresponds to mobile or desktop. 
  * Sets the dialog's configuration based on the screen width.
  * @param {MatDialogConfig} dialogConfig - The configuration for the dialog.
  * @param {ClientRect} rect - The bounding client rect of the reference element.
  */
  checkMobileOrDesktopVersion(dialogConfig) {
    if (this.genFuncService.isMobileWidth()) {
      dialogConfig.position = {
        bottom: `0px`
      };
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.panelClass = 'mobile-profile-menu-dialog';
    } else {
      dialogConfig.position = {
        top: `100px`,
        right: `25px`
      };
      dialogConfig.panelClass = 'custom-open-profile-menu-dialog';
    }
  }

  /**
  * Closes the chat and resets related properties to their default values.
  */
  closeChat() {
    this.genFuncService.changeMobileLogo = false;
    this.chatService.open_chat = false;
    this.chatService.thread_open = false;
    this.chatService.currentChatID = '';
  }
}
