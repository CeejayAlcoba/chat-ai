//===================JAVASCRIPT MODEL========================//
class ChatMenu {
  constructor({ chatMenuId, title }) {
    this.chatMenuId = chatMenuId;
    this.avatar =
      "https://cdn.icon-icons.com/icons2/643/PNG/512/android-robot-figure-avatar-brand_icon-icons.com_59276.png";
    this.title = title;
    ErrorObjectChecker(this);
  }

  layout() {
    return `
         <li class="clearfix" onclick="onChatMenuClick(${this.chatMenuId})" >
            <img src="${this.avatar}" alt="avatar">
            <div class="about">
                <div class="name">${this.title}</div>
                <div class="status"><i class="fa fa-circle online"></i> online </div>
            </div>
        </li>`;
  }
  chatHeaderLayout() {
    return `
   
    <img src="${this.avatar}" alt="avatar">

<div class="chat-about">
    <h6 class="m-b-0">${this.title}</h6>
    <div class="status"> <i class="fa fa-circle online"></i> online </div>
</div>
    `;
  }
}

class Message {
  constructor({ chatMenuId, role, content }) {
    this.chatMenuId = chatMenuId;
    this.role = role;
    this.content = content;
    ErrorObjectChecker(this);
  }
  layout() {
    let className =
      this.role == "user"
        ? "message other-message float-right"
        : "message my-message";
    return `
        <li class="clearfix">
             <div class="${className}">${this.content}</div>
          </li>
        `;
  }
}
class OpenAiService {
  constructor() {
    this.URL = "https://api.openai.com/v1/chat/completions";
    this.token = "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";
    this.model = "gpt-3.5-turbo";
  }
  async get(messages = []) {
    const response = await fetch(this.URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ model: this.model, messages }),
    });
    return response.json();
  }
}
class Choice {
  constructor({ index, message, logprobs, finish_reason }) {
    this.index = index;
    this.message = new Message(message);
    this.logprobs = logprobs;
    this.finish_reason = finish_reason;
  }
}
const ErrorObjectChecker = (object = {}) => {
  Object.keys(object).map((key) => {
    if (object[key] == undefined)
      throw new Error(`Object name ${key} is required!`);
  });
};

//===================GLOBAL VARIBALE========================//

let messenges = [];
let chatMenus = [];
let activeChatMenu = 1;
let openAiService = new OpenAiService();
const currentMessage = () => $("#message-input").val();
const filteredMessage = () =>
  messenges.filter((message) => message.chatMenuId == activeChatMenu);

//==================DOCUMENT READY==========================//
$(document).ready(() => {
  handlers();
});
//==================EVENT HANDLER==========================//
const handlers = () => {
  $("#send-button").on("click", () => {
    onSend();
  });
  $("#add-chat-menu").on("click", () => {
    onAddChatMenu();
  });

  $("#search-icon").on("click", () => {
    onSearchChatMenu();
  });
};

//====================HANDLER FUNCTIONS==============================//
const onSearchChatMenu = () => {
  let search = $("#search-chat-menu").val();
  if (search == "") return generateChatMenus();
  let filteredChatMenus = chatMenus.filter(
    (chatMenu) => chatMenu.title == search
  );
  generateChatMenus(filteredChatMenus);
};
const onAddChatMenu = () => {
  const isValid = isInputValidation("chat-menu-title");

  if (isValid) {
    let lastMenuId =
      chatMenus.length == 0
        ? 0
        : new ChatMenu(chatMenus[chatMenus.length - 1])?.chatMenuId;
    lastMenuId += 1;
    chatMenus = [
      ...chatMenus,
      new ChatMenu({
        chatMenuId: lastMenuId,
        title: $("#chat-menu-title").val(),
      }),
    ];
    activeChatMenu = lastMenuId;
    $("#chat-menu-title").val("");
    $("#modal-add-chat-menu").modal("hide");
    generateChatMenus();
    generateChatHeader();
    generateChats();
  }
};
const onChatMenuClick = (chatMenuId) => {
  activeChatMenu = chatMenuId;
  generateChats();
  generateChatHeader();
};
const onSend = async () => {
  const isValid = isInputValidation("message-input");
  if (!isValid) return;

  if (chatMenus.length == 0) {
    let message = $("#message-input").val();
    // activeChatMenu = 1;
    chatMenus = [
      ...chatMenus,
      new ChatMenu({ chatMenuId: 1, title: message.substring(0, 11) + "..." }),
    ];
  }

  messenges = [
    ...messenges,
    new Message({
      chatMenuId: activeChatMenu,
      role: "user",
      content: currentMessage(),
    }),
  ];
  generateChats();
  $("#message-input").val("");
  const { choices } = await openAiService.get(
    filteredMessage().map(({ chatMenuId, ...rest }) => rest)
  );
  messenges = [
    ...messenges,
    { chatMenuId: activeChatMenu, ...choices[0].message },
  ];
  generateChatMenus();
  generateChatHeader();
  generateChats();
};

const isInputValidation = (elementId) => {
  let element = $(`#${elementId}`);
  if (element.val() == "") {
    element.addClass("border-danger");
    return false;
  }
  element.removeClass("border-danger");
  return true;
};

//=======================JS DOM GENERATE==========================//
const generateChats = () => {
  $(".chat-history ul").empty();

  filteredMessage().map((message) => {
    const layout = new Message(message).layout();
    $(".chat-history ul").append(layout);
  });
};
const generateChatHeader = () => {
  $(".chat-header").empty();
  console.log(chatMenus, activeChatMenu);
  let foundChatMenu = chatMenus.find(
    (menu) => menu?.chatMenuId == activeChatMenu
  );
  let chatMenu = new ChatMenu(foundChatMenu);
  $(".chat-header").append(chatMenu.chatHeaderLayout());
};
const generateChatMenus = (initChatMenus) => {
  $(".chat-about").empty();
  $(".chat-list").empty();
  let newChatMenus = initChatMenus ?? chatMenus;
  newChatMenus.map((chatMenu) => {
    const newChat = new ChatMenu(chatMenu);
    newChat.title = newChat.title.substring(0, 11) + "...";
    $(".chat-list").append(newChat.layout());
  });
};
