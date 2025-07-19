import { TelegramMessage } from 'src/models/TelegramMessage';

export class TelegramService {

  constructor() { }

  /**
   * Sends message to Telegram chat bot through Telegram's API
   * @param message 
   */
  async sendMessage(botToken: string, message: TelegramMessage){
    return new Promise<void>(async (resolve, reject) => {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        body: JSON.stringify(message),
        method: "post",
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(async response => {
        if(response.status === 200){
          resolve()
          return
        }
        reject()
      }).catch(err => {
        console.log("ERROR:", String(err))
        reject(err)
      })
    })
  }

  async getChat(telegramBotToken: string, chatId: number): Promise<GetChatResponse.GetChatResponse>{
    return new Promise((resolve, reject) => {
      fetch(`https://api.telegram.org/bot${telegramBotToken}/getChat`, {
        method: "post",
        body: JSON.stringify({
          chat_id: chatId
        }),
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(async response => {
        if(response.status === 200){
          resolve(await response.json())
          return
        }
        reject()
      }).catch(err => {
        reject(err)
      })
    })
  }

  async getUpdates(telegramBotToken: string): Promise<GetUpdatesResponse.GetUpdatesResponse>{
    return new Promise((resolve, reject) => {
      fetch(`https://api.telegram.org/bot${telegramBotToken}/getUpdates`, {
        method: "get",
      }).then(async response => {
        if(response.status === 200){
          resolve(await response.json())
          return
        }
        reject()
      }).catch(err => {
        reject(err)
      })
    })
  }

  async getMe(telegramBotToken: string): Promise<GetMe.GetMe>{
    return new Promise((resolve, reject) => {
      fetch(`https://api.telegram.org/bot${telegramBotToken}/getMe`, {
        method: "get",
      }).then(async response => {
        if(response.status === 200){
          resolve(await response.json())
          return
        }
        reject()
      }).catch(err => {
        reject(err)
      })
    })
  }
}

namespace GetMe {
  export interface GetMe {
    ok: boolean;
    result: Result;
  }
  interface Result {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
    can_connect_to_business: boolean;
  }
}

namespace GetChatResponse {
  export interface GetChatResponse {
    ok: boolean;
    result: Result;
  }
  interface Result {
    id: number;
    title: string;
    type: string;
    invite_link: string;
    has_visible_history: boolean;
    accent_color_id: number;
  }
}

namespace GetUpdatesResponse {
  export interface GetUpdatesResponse {
    ok: boolean;
    result: Result[];
  }
  interface Result {
    update_id: number;
    channel_post: Channelpost;
  }
  interface Channelpost {
    message_id: number;
    sender_chat: Senderchat;
    chat: Senderchat;
    date: number;
    text: string;
  }
  interface Senderchat {
    id: number;
    title: string;
    type: string;
  }
}
