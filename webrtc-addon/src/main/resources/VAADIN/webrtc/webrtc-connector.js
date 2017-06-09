'use strict';
/**
 * WebRTC frontend wrapper.
 *
 * For more information see: https://temasys.com.sg
 */
window.org_vaadin_webrtc_WebRTC = function() {

  var API_KEY = "097404bd-1426-4fbd-9c99-5cf97eeeecd4";

  var self = this;
  var selfElementWidth = "30%";
  var selfVideoId = "selfVideo";
  var peerElementWidth = "70%";
  var peerVideoId = "peerVideo";

  // build UI
  var element = self.getElement();
  var container = document.createElement("div");
  container.setAttribute("class", "container");

  var videosContainer = createVideo();
  container.appendChild(videosContainer);

  var messagesContainer = createChat();
  container.appendChild(messagesContainer);

  var toggleSizesButton = createToggleStreamSizesButton();
  container.appendChild(toggleSizesButton);

  element.appendChild(container);

  // setup Skylink
  var skylink = new Skylink();

  skylink.on('peerJoined', function(peerId, peerInfo, isSelf) {
    console.log("[peerJoined]: " + peerId + " " + isSelf);
  });

  skylink.on('incomingStream', function(peerId, stream, isSelf) {
    console.log("[incomingStream]: " + peerId + " " + isSelf);
    if (isSelf) {
      var video = document.getElementById(selfVideoId);
      video.srcObject = stream;
      setElementWidth(video, selfElementWidth);
      showElement(video);
    } else {
      var video = document.getElementById(peerVideoId);
      video.srcObject = stream;
      setElementWidth(video, peerElementWidth);
      showElement(video);
      showElement(toggleSizesButton);
    }
  });

  skylink.on("incomingMessage", function(message, peerId, stream, isSelf) {
    console.log(message.content);
    var chatArea = document.getElementById('chat');
    var chatHistory = chatArea.value;
    chatArea.value = chatHistory + "\n" + message.content;
  });

  skylink.on("peerLeft", function(peerId, peerInfo, isSelf) {
    if (!isSelf) {
      var video = document.getElementById(peerVideoId);
      video.srcObject = null;
      hideElement(video);
      hideElement(toggleSizesButton);
    }
  });

  // WebRTC addon exposed methods
  this.showWebCam = function() {
    skylink.getUserMedia(function(error, stream) {
      if (error) {
        console.error("Unable to get camera feed " + error);
        return;
      } else {
        var video = document.getElementById(selfVideoId);
        video.srcObject = stream;
        showElement(video);
      }
    });
  }

  this.joinRoom = function(username, roomid) {
    // init() should always be called first before other methods other than event methods like on() or off().
    skylink.init(API_KEY, function(error, success) {
      if (success) {
        skylink.joinRoom(roomid, {
          userData: username,
          audio: true,
          video: true
        });
      } else if (error) {
        console.error("An error occurred while initializing skylink " + error.error.message);
      }
    });
  }

  this.leaveRoom = function(username, roomid) {
    skylink.leaveRoom(roomid, {userData: username});
    hideElement(toggleSizesButton);
    self.showWebCam();
  }

  this.resizeSelfWidth = function(width) {
    var video = document.getElementById(selfVideoId);
    setElementWidth(video, width);
  };

  this.resizePeerWidth = function(width) {
    var video = document.getElementById(peerVideoId);
    setElementWidth(video, width);
  };

  // Utility functions
  function setElementWidth(element, width) {
    element.setAttribute('width', width);
  }

  function showElement(element) {
    element.classList.remove("hidden");
  }

  function hideElement(element) {
    element.classList.add("hidden");
  }

  function createVideo() {
    var videosContainer = document.createElement("div");
    videosContainer.id = "videos-container";
    videosContainer.setAttribute("class", "video-container");
    container.appendChild(videosContainer);

    var selfVideo = createVideoElement(selfVideoId);
    setElementWidth(selfVideo, selfElementWidth);
    var peerVideo = createVideoElement(peerVideoId);
    setElementWidth(peerVideo, selfElementWidth);
    videosContainer.appendChild(selfVideo);
    videosContainer.appendChild(peerVideo);
    return videosContainer;
  }

  function createVideoElement(videoId) {
    var video = document.createElement('video');
    video.id = videoId;
    video.classList.add("video-element");
    video.classList.add("hidden"); //initilly hidden
    video.autoplay = true;
    video.muted = true;
    return video;
  }

  function createChat() {
    var textArea = document.createElement("textarea");
    textArea.id = 'chat';
    textArea.setAttribute('readonly', true);
    textArea.classList.add("chat-box");
    textArea.classList.add("v-textarea");

    var inputField = document.createElement("input");
    inputField.setAttribute("type", "text");
    inputField.classList.add("chat-input");
    inputField.classList.add("v-textfield");

    var button = document.createElement("button");
    button.innerHTML = "Send message";
    button.classList.add("chat-send");
    button.classList.add("v-button");
    button.addEventListener("click", function(event) {
      var message = inputField.value;
      if (message !== undefined && message !== "") {
        console.log("broadcasting message: " + message);
        var peers = skylink.getPeersInRoom('');
        skylink.sendMessage(message);
        inputField.value = "";
      }
    });

    var messageInputContainer = document.createElement("div");
    messageInputContainer.classList.add("chat-controls");
    messageInputContainer.appendChild(inputField);
    messageInputContainer.appendChild(button);

    var messageContainer = document.createElement("div");
    messageContainer.id = "chat-container";
    messageContainer.setAttribute("class", "chat-container");
    messageContainer.appendChild(textArea);
    messageContainer.appendChild(messageInputContainer);
    return messageContainer;
  }

  function createToggleStreamSizesButton() {
    var toggleSizes = document.createElement("button");
    toggleSizes.innerHTML = "Toggle";
    toggleSizes.classList.add("toggle-button");
    toggleSizes.classList.add("hidden");
    toggleSizes.classList.add("v-button");
    toggleSizes.addEventListener("click", function(event) {
      var videos = document.getElementsByTagName('video');
      if (videos.length > 1) {
        switchWidths(videos[0], videos[1]);
      }
    });
    function switchWidths(firstElement, secondElement) {
      var temp = firstElement.getAttribute('width');
      firstElement.setAttribute('width', secondElement.getAttribute('width'));
      secondElement.setAttribute('width', temp);
    }
    return toggleSizes;
  }
};
