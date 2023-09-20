import { Injectable } from '@angular/core';
import { ChatService } from './chat.service';
import { MessagesService } from './messages.service';
import { GeneralFunctionsService } from './general-functions.service';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root'
})
export class OpenChatService {

  constructor(
    public chatService: ChatService,
    public msgService: MessagesService,
    public genFunctService: GeneralFunctionsService,
    public channelService: ChannelService
  ) { }

  async openChat(id: string, chatSection: string = 'chats') {
    this.ensureChatSectionVisible();
    if (this.chatService.currentChatID !== id) {
      this.chatService.currentChatSection = chatSection;
      this.setCurrentID(id);
      await this.getCurrentData();
    }
  }


  checkChangeToMobileLogo() {
    if (window.innerWidth <= 1000) {
      this.genFunctService.changeMobileLogo = true;
    }
  }


  setCurrentID(id: string) {
    this.chatService.currentChatID = id;
    if (this.chatService.currentChatSection == 'channels') this.channelService.currentChannelID = id;
    this.msgService.emptyMessageText();
  }


  async getCurrentData() {
    this.chatService.getCurrentChatData();
    this.chatService.textAreaMessageTo();
    if (this.chatService.currentChatSection == 'channels') this.channelService.loadCurrentChannel();
    this.msgService.getMessages().then(() => {
      this.chatService.thread_open = false;
      this.msgService.scrollToBottom()
    });
  }


  ensureChatSectionVisible() {
    this.checkChangeToMobileLogo();
    this.chatService.open_chat = true
    if (this.chatService.openNewMsgComponent) this.chatService.openNewMsgComponent = false;
  }
}
