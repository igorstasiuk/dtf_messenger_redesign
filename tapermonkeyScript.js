// ==UserScript==
// @name        DTF Messenger Redesign Edition
// @namespace   ¯\_(ツ)_/¯
// @match       https://dtf.ru/*
// @version     0.1.0
// @author      ¯\_(ツ)_/¯
// @description ¯\_(ツ)_/¯
// ==/UserScript==

(() => {
  let access_token;
  let access_token_promise = Promise.withResolvers();
  let new_messages_counter = null;
  let channels = [];
  let channel = {};
  let messages = [];

  let panel_button;
  let profile_button_btn;
  let channels_list__popover;
  let channel__popover;

  const bc = new BroadcastChannel("osnova-events");
  bc.onmessage = ({ data: { type, detail } }) => {
    if (type === "auth session updated") {
      access_token = detail.session.accessToken;
      access_token_promise.resolve();
    }
  };

  const DEBUG = true;
  const LOG_NAME = "DTF Messenger";
  const _log = DEBUG
    ? (m) => {
        console.log(`${LOG_NAME}: ${m}`);
      }
    : () => {};

  function notify(text) {
    const p_elem = document.createElement("p");
    const notify_elem = document.createElement("div");
    notify_elem.appendChild(p_elem);
    p_elem.innerHTML = text;
    notify_elem.style.cssText =
      "position:fixed; top:10px; right:10px; z-index:11; padding:10px; border-radius:5px; background:#fff;";
    p_elem.style.cssText = "color:#333";
    document.body.appendChild(notify_elem);
    setTimeout(() => {
      notify_elem.remove();
    }, 5000);
  }

  async function api__get_access_token() {
    return access_token_promise.promise;
  }

  async function api__message_uploader(file_content) {
    const post_data = new FormData();
    post_data.append("file", file_content);

    const response = await fetch("https://api.dtf.ru/v2.5/uploader/upload", {
      method: "post",
      body: post_data,
      headers: new Headers({
        JWTAuthorization: "Bearer " + access_token,
      }),
    });
    let _response_json = await response.json();

    if (_response_json && _response_json.result) {
      return _response_json.result;
    }
  }

  async function api__message_send(channelId, text, media) {
    const post_data = new FormData();
    post_data.append("channelId", channelId);
    post_data.append("text", text);
    post_data.append("ts", (Date.now() / 1000).toString());
    post_data.append("idTmp", (Date.now() / 1000).toString());
    post_data.append("media", JSON.stringify(media));

    const response = await fetch("https://api.dtf.ru/v2.5/m/send", {
      method: "post",
      body: post_data,
      headers: new Headers({
        Accept: "application/json",
        JWTAuthorization: "Bearer " + access_token,
      }),
    });
    let _response_json = await response.json();
  }

  async function api__messages_counter() {
    const response = await fetch("https://api.dtf.ru/v2.5/m/counter", {
      method: "get",
      headers: new Headers({
        Accept: "application/json",
        JWTAuthorization: "Bearer " + access_token,
      }),
    });
    let _response_json = await response.json();

    if (
      _response_json &&
      _response_json.result &&
      _response_json.result.counter
    )
      new_messages_counter = _response_json.result.counter;
  }

  async function api__channels() {
    const response = await fetch("https://api.dtf.ru/v2.5/m/channels", {
      method: "get",
      headers: new Headers({
        Accept: "application/json",
        JWTAuthorization: "Bearer " + access_token,
      }),
    });
    let _response_json = await response.json();

    if (
      _response_json &&
      _response_json.result &&
      _response_json.result.channels
    )
      channels = _response_json.result.channels;
  }

  async function api__channel(channel_id) {
    const response = await fetch(
      `https://api.dtf.ru/v2.5/m/channel?id=${channel_id}`,
      {
        method: "get",
        headers: new Headers({
          Accept: "application/json",
          JWTAuthorization: "Bearer " + access_token,
        }),
      }
    );
    const _response_json = await response.json();

    if (_response_json.result && _response_json.result.channel !== undefined) {
      channel = _response_json.result.channel;
    }
  }

  async function api__messages(channel_id, beforeTime) {
    const response = await fetch(
      `https://api.dtf.ru/v2.5/m/messages?channelId=${channel_id}&beforeTime=${beforeTime}`,
      {
        method: "get",
        headers: new Headers({
          Accept: "application/json",
          JWTAuthorization: "Bearer " + access_token,
        }),
      }
    );
    const _response_json = await response.json();

    if (_response_json.result && _response_json.result.messages !== undefined) {
      messages = _response_json.result.messages;
    }
  }

  function profile_button__add() {
    if (document.getElementById("profile_button")) return;

    let btns_in_profile = document.querySelector(".subsite-header__controls");
    if (btns_in_profile) {
      profile_button_btn = document.createElement("button");
      profile_button_btn.classList =
        "button button--size-m button--type-primary";
      profile_button_btn.style.background = "#8000ff";
      profile_button_btn.innerText = "Написать";
      profile_button_btn.id = "profile_button";
      btns_in_profile.prepend(profile_button_btn);

      profile_button_btn.addEventListener("click", async function () {
        const url_parts = window.location.href
          .replace("https://dtf.ru/u/", "")
          .split("-");
        if (Number.isInteger(Number(url_parts[0]))) {
          await api__channel(url_parts[0]);
          await open_channel();
        }
      });
    }
  }

  async function open_channel() {
    if (channels_list__popover) channels_list__popover.style.display = "none";

    if (channel__popover) channel__popover.remove();

    await api__messages(channel.id, Date.now() / 1000);

    channel__popover = channel__popover__html();
    channel__popover.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    document.body.appendChild(channel__popover);

    let channel__popover__messages = document.querySelector(
      ".channel__popover__messages"
    );
    channel__popover__messages.scrollTo(
      0,
      channel__popover__messages.scrollHeight
    );

    const text = document.getElementById("new_message__text");
    const attachment = document.getElementById("new_message__attachment");
    const svg = document.getElementById("new_message__svg");

    svg.addEventListener("click", async (event) => {
      attachment.click();
    });

    attachment.addEventListener("change", function (event) {
      if (event.target.files[0]) {
        svg.style.background = "#88f";
      }
    });

    document
      .getElementById("new_message__button")
      .addEventListener("click", async (event) => {
        if (text.value) {
          let media = [];
          if (attachment.files[0])
            media = await api__message_uploader(attachment.files[0]);

          await api__message_send(channel.id, text.value, media);
          await open_channel();
        } else {
          notify("Сообщение не должно быть пустым!");
        }
      });

    window.addEventListener("click", (event) => {
      channel__popover.remove();
    });

    return false;
  }

  async function panel_button__add() {
    if (document.getElementById("panel_button")) return;

    if (new_messages_counter === null) await api__messages_counter();

    panel_button = document.createElement("div");
    panel_button.className = "bell";
    panel_button.id = "panel_button";
    const div_bell__button = document.createElement("button");
    div_bell__button.className = "bell__button";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList = "icon icon--bell bell__button-icon";
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");

    const use = document.createElementNS("http://www.w3.org/1999/xlink", "use");
    use.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      "#messenger"
    );
    svg.appendChild(use);

    if (new_messages_counter) {
      const div_counter = document.createElement("div");
      div_counter.classList = "counter-label bell__unread-count";
      div_counter.innerText = new_messages_counter ? new_messages_counter : "";
      div_bell__button.appendChild(div_counter);
    }

    panel_button.appendChild(div_bell__button);
    div_bell__button.appendChild(svg);

    let bell_btn = document.querySelector("div.header__right .bell");
    if (bell_btn) {
      bell_btn.after(panel_button);
    }

    panel_button.addEventListener("click", async (event) => {
      event.stopPropagation();

      window.addEventListener("click", function () {
        if (channels_list__popover.style.display !== "none")
          channels_list__popover.style.display = "none";
      });

      if (!channels_list__popover) {
        await api__channels();
        channels_list__popover = channels_list__popover__html();
        channels_list__popover.addEventListener("click", (event) => {
          event.stopPropagation();
        });

        document
          .querySelector("#panel_button button")
          .after(channels_list__popover);

        document
          .querySelectorAll("#channels_list__popover a")
          .forEach(function (elem) {
            elem.addEventListener("click", (event) => {
              channel = channels[elem.dataset.channel_index];
              open_channel();
            });
          });
      } else {
        if (channels_list__popover.style.display === "block")
          channels_list__popover.style.display = "none";
        else channels_list__popover.style.display = "block";
      }
    });
  }

  function channel__popover__html() {
    let html = document.createElement("div");
    html.classList = "channel__popover";
    html.id = "channel__popover";

    let innerHTML = `
<div class="channel__popover__header" >
    <a href="/u/${channel.id}" target="_blank" >
        <img src="${channel.picture}-/format/jpeg/-/scale_crop/72x72/"  alt="" loading="lazy" />
        <span>${channel.title}</span>
    </a>
</div>
<div class="channel__popover__messages" >
    <div class="channel__popover__messages__content" >`;

    messages.forEach(function (message) {
      innerHTML += `
    <div class="channel__popover__messages__message"  >`;

      innerHTML += `
        <div class="channel__popover__messages__message__image">`;

      if (!message.sameAuthor)
        innerHTML += `
            <div class="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--has-preview andropov-image"
            style="aspect-ratio: 1 / 1; width: 36px; height: 36px; max-width: none; --background-color: #dddddd;" data-loaded="true" >
                <picture>
                    <source
                    srcSet="${message.author.picture}-/format/jpeg/-/scale_crop/72x72/-/format/webp, ${message.author.picture}-/format/jpeg/-/scale_crop/72x72/-/format/webp 2x"
                    type="image/webp" />
                    <img
                    src="${message.author.picture}-/format/jpeg/-/scale_crop/72x72/"
                    srcSet="${message.author.picture}-/format/jpeg/-/scale_crop/72x72/, ${message.author.picture}/-/format/jpeg/-/scale_crop/72x72/ 2x"
                    alt="" loading="lazy" />
                </picture>
            </div>`;

      innerHTML += `
        </div>`;

      innerHTML += `
        <div class="channel__popover__messages__message__body">
            <b>${message.author.title}</b>`;

      if (message.text)
        innerHTML += `
            <div>${message.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;

      if (message.media) {
        innerHTML += `
            <div class="channel__popover__messages__message__media">`;

        if (message.media[0]) {
          if (
            message.media[0].type === "image" &&
            message.media[0].data.type !== "gif"
          ) {
            innerHTML += `
                <a href="https://leonardo.osnova.io/${message.media[0].data.uuid}/" target="_blank">
                    <img src="https://leonardo.osnova.io/${message.media[0].data.uuid}/-/preview/100x/" />
                </a>`;
          }
          if (
            message.media[0].type === "video" ||
            message.media[0].data.type === "gif"
          ) {
            innerHTML += `
                <a href="https://leonardo.osnova.io/${message.media[0].data.uuid}/" target="_blank">
                    <video preload="auto" autoPlay="" playsInline="true" loop="" src="https://leonardo.osnova.io/${message.media[0].data.uuid}/-/format/mp4#t=0.1"></video>
                </a>`;
          }
        }

        innerHTML += `
            </div>`;
      }

      innerHTML += `
        </div>

        <div class="channel__popover__messages__message__date">
            <p>${date_format(message.dtCreated)}</p>
        </div>`;

      innerHTML += `
    </div>`;
    });
    innerHTML += `
    </div>
</div>`;

    innerHTML += `
<div class="channel__popover__footer" id="new_message" >
    <textarea placeholder="Сообщение" id="new_message__text" ></textarea>
    <input type="file" class="attachment" id="new_message__attachment" />
    <svg id="new_message__svg" class="icon" width="40" height="24"><use xlink:href="#pin"></use></svg>
    <button id="new_message__button" >Отправить</button>
</div>`;

    html.innerHTML = innerHTML;
    return html;
  }

  function channels_list__popover__html() {
    let html = document.createElement("div");
    html.classList =
      "channels_list__popover notifications-popover bell__popover";
    html.id = "channels_list__popover";

    let innerHTML = `
<div class="notifications notifications--compact">
    <div class="navbar">
        <div class="navbar__title">Сообщения</div>
        <div class="navbar__right">
            <div class="dropdown">
                <button class="icon-button" type="button">
                    <svg class="icon icon--dots" width="24" height="24">
                    <use xlink:href="#dots"></use>
                    </svg>
                </button>
            </div>
        </div>
    </div>
    <div class="notifications__body">

        <div data-scrollable="" class="notifications__list">`;

    channels.forEach(function (obj, index) {
      innerHTML += `
            <a class="notification-item notification-item--compact"
            href="javascript:void(0);" data-channel_index="${index}"   >`;

      innerHTML += `
                <div class="notification-item__image">
                    <div
                    class="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--has-preview andropov-image"
                    style="aspect-ratio: 1 / 1; width: 36px; height: 36px; max-width: none; --background-color: #dddddd;" data-loaded="true" >
                        <picture>
                            <source
                            srcSet="${obj.picture}-/format/jpeg/-/scale_crop/72x72/-/format/webp, ${obj.picture}-/format/jpeg/-/scale_crop/72x72/-/format/webp 2x"
                            type="image/webp" />
                            <img
                            src="${obj.picture}-/format/jpeg/-/scale_crop/72x72/"
                            srcSet="${obj.picture}-/format/jpeg/-/scale_crop/72x72/, ${obj.picture}/-/format/jpeg/-/scale_crop/72x72/ 2x"
                            alt="" loading="lazy" />
                        </picture>
                    </div>
                </div>

                <div>
                    <div class="notification-item__text">
                        <b>${obj.title}</b>`;

      if (obj.lastMessage && obj.lastMessage.text)
        innerHTML += `
                        <div class="notification-item__text">${obj.lastMessage.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;

      if (obj.lastMessage && obj.lastMessage.media)
        innerHTML += `
                        <div class="notification-item__media"><svg class="icon" width="24" height="24"><use xlink:href="#pin"></use></svg> Прикрепленный файл</div>`;

      innerHTML += `
                    </div>
                </div>`;

      if (obj.lastMessage && obj.lastMessage.dtCreated) {
        innerHTML += `
                <div>
                    <div class="notification-item__date">${date_format(obj.lastMessage.dtCreated)}</div>`;

        if (obj.unreadCount > 0)
          innerHTML += `
                    <div class="notification-item__unreadCount">${obj.unreadCount}</div>`;

        innerHTML += `
                </div>`;
      }

      innerHTML += `
            </a>`;
    });

    innerHTML += `
        </div>
        <div class="notifications__more">
            <a class="link-button link-button--small" href="/channels">Все чаты</a>
        </div>
    </div>
</div>`;
    html.innerHTML = innerHTML;
    return html;
  }

  function date_format(date) {
    let time_string = "";
    let minutes_past = Math.floor((Date.now() / 1000 - date) / 60);
    if (minutes_past < 60) {
      time_string = minutes_past + "м";
    } else if (minutes_past < 24 * 60) {
      time_string = Math.floor(minutes_past / 60) + "ч";
    } else if (minutes_past < 24 * 7 * 60) {
      time_string = Math.floor(minutes_past / 60 / 24) + "д";
    } else if (minutes_past < 24 * 180 * 60) {
      time_string = new Date(date * 1000).toLocaleString("ru", {
        month: "short",
        day: "numeric",
        timezone: "UTC",
      });
    } else {
      time_string =
        new Date(date * 1000).toLocaleString("ru", {
          month: "short",
          day: "numeric",
          timezone: "UTC",
        }) +
        "<br/>" +
        new Date(date * 1000).getFullYear();
    }
    return time_string;
  }

  function add_css() {
    let css = `
.channels_list__popover .notification-item__media svg.icon {float: left;}
.channels_list__popover .notification-item__date {text-align:center; white-space: nowrap;}
.channels_list__popover .notification-item__unreadCount {
    height: 24px;
    border-radius: 12px;
    background: #88f;
    text-align: center;
    margin: 0 auto;
    white-space: nowrap;
    padding: 0 5px;
}
.channel__popover {
    position:fixed;
    width:400px;
    height:650px;
    right:5px;
    bottom:5px;
    border:solid 4px #eee;
    background:#ccc;
    border-radius:20px;
    padding:5px;
    z-index:10;
}
.channel__popover * {
    color: #333;
    font-size: 15px;
}
.channel__popover__header {}
.channel__popover__header img {
    width:72px;
    height:72px;
    display:block;
    margin: 0 auto;
    border-radius:18px;
    border: solid 3px #666;
}
.channel__popover__header a {font-weight:bold; text-align:center; display: block;  }
.channel__popover__messages {
    height:400px;
    overflow-x: hidden;
    overflow-y: auto;
}
.channel__popover__messages__content {

}

.channel__popover__messages__message {
    display: grid;
    grid-template-columns: 36px 1fr 54px;
    grid-gap: 10px;
    padding: 3px;
    margin:3px;
    background: #fff;
    border-radius: 10px;
}
.channel__popover__messages__message__image {
    display: inline-flex;
    align-items: center;
}
.channel__popover__messages__message__body {}
.channel__popover__messages__message__body b {font-weight: bold;}
.channel__popover__messages__message__body div {line-height:15px;}
.channel__popover__messages__message__media {
    margin:5px 0 0 0;
}
.channel__popover__messages__message__media video {
    max-width: 100%;
}
.channel__popover__messages__message__date {
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    line-height: 14px;
}

.channels_list__popover .notification-item {
  --image-size: 36px;
}
.channel__popover__footer {margin: 10px 0 0 0;}
.channel__popover__footer textarea {
    width: calc(100% - 10px);
    height: 60px;
    resize: none;
    padding: 5px;
    color:#fff;
}
.channel__popover__footer input {display:none;}
.channel__popover__footer svg {
    border:solid 2px #000;
    border-radius: 4px;
    float:left;
    padding:5px;
    margin: 0 10px 0 0;
    cursor: pointer;
}
.channel__popover__footer button {
    background: #88f;
    padding:5px;
    border-radius:5px;
    line-height:28px;
    color: #fff;
    cursor: pointer;
    float:right;
}

`;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);
  }

  async function main() {
    add_css();
    await api__get_access_token();
    setInterval(api__get_access_token, 1800000);
    await panel_button__add();
    await profile_button__add();
  }

  window.addEventListener("DOMContentLoaded", async () => {
    await main();
  });

  let html_tag_observer = new MutationObserver(async (mutationRecords) => {
    html_tag_observer.disconnect();
    await main();
    html_tag_observer__start();
  });
  html_tag_observer__start();

  function html_tag_observer__start() {
    html_tag_observer.observe(document.querySelector(`html`), {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: false,
    });
  }
})();
