import { Component, HostListener } from '@angular/core';
import { ChannelService } from 'services/channel.service';
import { AuthenticationService } from 'services/authentication.service';
import { ChatService } from 'services/chat.service';
import { MessagesService } from 'services/messages.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
import { OpenChatService } from 'services/open-chat.service';

@Component({
  selector: 'app-new-msg',
  templateUrl: './new-msg.component.html',
  styleUrls: ['./new-msg.component.scss']
})
export class NewMsgComponent {

  inputValue: string;
  filteredUsersByName = [];
  filteredUsersByEmail = [];
  authorizedChannels = [];
  filteredChannels = [];
  selectedValue: string;
  showAutocomplete: boolean = false;

  constructor(
    public authService: AuthenticationService,
    public channelService: ChannelService,
    public chatService: ChatService,
    public msgService: MessagesService,
    public genFunctService: GeneralFunctionsService,
    public openChatService: OpenChatService) {
    this.checkIfInputNotEmpty();
    this.configureInputValue();
  }


  /**
   * Toggles the visibility of the autocomplete based on where the click event occurs.
   * If the click is inside the autocomplete or input elements, it displays the autocomplete.
   * Otherwise, it hides the autocomplete.
   * @param {HTMLElement} targetElement - The element that received the click.
   */
  @HostListener('click', ['$event.target'])
  onClick(targetElement: HTMLElement) {
    const clickedElement = targetElement.closest('#autocomplete, #input');
    if (clickedElement) this.showAutocomplete = true;
    else this.showAutocomplete = false;
  }


  /**
   * Handles value changes, clears previous results, and retrieves filtered users and channels based on the value.
   * @param {string} value - The search input value.
   */
  async valueChange(value: string) {
    this.clearArrays();
    this.filteredUsersByName = await this.authService.filterUsers(value);
    this.filteredUsersByEmail = await this.authService.filterUsersByEmail(value);
    this.authorizedChannels = await this.channelService.getChannels(this.authService.userData.uid);
    this.filteredChannels = this.authorizedChannels.filter(channel => channel.channelName.toLowerCase().startsWith(value.toLowerCase())
    );
  }


  /**
   * Checks for an existing chat with the selected user. If none found, creates a new one.
   * @param {string} nameOrMail - The name or email of the selected user.
   * @param {string} category - The category of the selected item ('userName', 'userEmail', or 'channel').
   * @param {any} user - The user object of the selected user.
   */
  selectValue(nameOrMail: string, category: string, user: any) {
    this.genFunctService.highlightInput.next(false);
    if (category == 'userName' || category == 'userEmail') this.checkExistingChat(user, nameOrMail);
    if (category == 'channel') this.openChatService.openChat(nameOrMail, 'channels');
    this.selectedValue = nameOrMail;
    this.clearArrays();
  }

  /**
  * Checks for an existing chat with the selected user. If none found, creates a new one.
  * @param {any} selectedUser - The selected user object.
  * @param {string} [clickedValue] - The name of the clicked user.
  */
  async checkExistingChat(selectedUser, clickedValue?: string) {
    if (await this.findChatWithUser(this.authService.auth.currentUser.uid, selectedUser.uid)) return;
    await this.createNewChat(selectedUser, clickedValue);
  }


  /**
  * Searches for an existing chat between two users.
  * @param {string} currentUserUID - The UID of the current user.
  * @param {string} selectedUserUID - The UID of the selected user.
  * @return {boolean} - Returns true if a chat is found, otherwise returns false.
  */
  async findChatWithUser(currentUserUID: string, selectedUserUID: string) {
    for (const chat of this.chatService.chats) {
      if (chat.chat_Member_IDs) {
        if (
          chat.chat_Member_IDs.includes(currentUserUID) &&
          chat.chat_Member_IDs.includes(selectedUserUID)
        ) {
          this.openChatService.openChat(chat.chat_ID);
          return true;
        }
      }
    }
    return false;
  }


  /**
  * Creates a new chat with the selected user.
  * @param {any} selectedUser - The selected user object.
  * @param {string} clickedValue - The name of the clicked user.
  */
  async createNewChat(selectedUser, clickedValue: string) {
    this.inputValue = '@' + clickedValue;
    this.chatService.userReceiverID = selectedUser.uid;
    this.chatService.messageToPlaceholder = `Nachricht an ${selectedUser.user_name}`;
    this.chatService.currentChatSection = 'chats';
    this.chatService.currentChatID = await this.chatService.newChat(this.chatService.userReceiverID);
    this.chatService.currentChatData = await this.chatService.getChatDocument();
    this.msgService.getMessages();
  }


  /**
  * Clears the arrays containing filtered users and channels.
  */
  clearArrays() {
    this.filteredUsersByName = [];
    this.filteredUsersByEmail = [];
    this.filteredChannels = [];
  }


  /**
  * Closes the currently open chat and toggles the new message component's visibility after a delay.
  */
  closeChat() {
    this.chatService.open_chat = false;
    setTimeout(() => {
      this.chatService.openNewMsgComponent = !this.chatService.openNewMsgComponent;
    }, 300);
  }


  /**
   * Subscribes to the 'highlightInput' observable from 'genFunctService'. 
   * If the observable emits a truthy value, the input is highlighted in red.
   * Otherwise, the red highlight is removed.
   */
  checkIfInputNotEmpty() {
    this.genFunctService.highlightInput.subscribe(shouldHighlight => {
      const inputElement = document.getElementById('input');
      if (shouldHighlight) {
        inputElement.classList.add('highlight-red');
      } else {
        inputElement.classList.remove('highlight-red');
      }
    });
  }


  /**
   * Configures the 'inputValue' based on the 'chatService' properties.
   * If the user was directed from the profile button and a receiver name exists,
   * the 'inputValue' is set to '@' followed by the receiver's name.
   * Otherwise, it resets 'inputValue' and sets the placeholder for messages.
   */
  configureInputValue() {
    if (this.chatService.directedFromProfileButton && this.chatService.userReceiverName) {
      this.inputValue = '@' + this.chatService.userReceiverName;
    }
    else {
      this.inputValue = '';
      this.chatService.messageToPlaceholder = 'Nachricht an ...';
    }
  }
}



