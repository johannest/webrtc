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
  var selfStreamClass = "self-stream";
  var peerElementWidth = "70%";
  var peerStreamClass = "peer-stream";

  // build UI
  var element = self.getElement();
  var container = document.createElement("div");
  container.setAttribute("class", "flex-container  container");

  var videosContainer = document.createElement("div");
  videosContainer.id = "videos-container";
  videosContainer.setAttribute("class", "flex-container video-container");
  container.appendChild(videosContainer);

  var toggleSizesButton = createToggleStreamSizesButton();
  container.appendChild(toggleSizesButton);
  element.appendChild(container);

  // setup Skylink
  var skylink = new Skylink();

  skylink.on('peerJoined', function(peerId, peerInfo, isSelf) {
    console.log("[peerJoined]: " + peerId + " " + isSelf);
    if(isSelf) {
      var vid = document.getElementById(peerId);
      if (!vid) {
        addVideo(peerId, selfStreamClass);
      }
    } else {
      addVideo(peerId, peerStreamClass);
    }
  });

  skylink.on('incomingStream', function(peerId, stream, isSelf) {
    console.log("[incomingStream]: " + peerId + " " + isSelf);
    var vid = document.getElementById(peerId);
    vid.srcObject = stream;
    if (isSelf) {
      setElementWidth(vid, selfElementWidth);
    } else {
      setElementWidth(vid, peerElementWidth);
      toggleSizesButton.classList.remove("button-hidden");
    }
  });

  skylink.on("peerLeft", function(peerId, peerInfo, isSelf) {
    if (!isSelf) {
      var peerVideo = document.getElementById(peerId);
      if (peerVideo) { // do a check if peerVideo exists first
        videosContainer.removeChild(peerVideo);
      } else {
        console.error("Peer video for " + peerId + " is not found.");
      }
      toggleSizesButton.classList.remove("button-hidden");
    }
  });

  // webrtc methods
  this.shareWebCam = function(username, roomid) {
    // init() should always be called first before other methods other than event methods like on() or off().
    skylink.init(API_KEY, function(error, success) {
      if (success) {
        skylink.joinRoom(roomid, {
          userData: username,
          audio: true,
          video: true
        });
      } else if (error) {
        console.error("An error occurred while initializing skylink " + error);
      }
    });
  }

  this.disconnect = function() {
    //TODO: disconnect from room
  }

  this.resizeSelfWidth = function(width) {
    var element = document.getElementsByClassName(selfStreamClass);
    if (element) {
      setElementWidth(element[0], width);
    }
  };

  this.resizePeerWidth = function(width) {
    var videos = document.getElementsByClassName(peerStreamClass);
    for (var index = 0; index < videos.length; index++) {
      setElementWidth(videos[index], width);
    }
  };

  // Utility functions
  function addVideo(peerId, videoClass) {
    var vid = document.createElement('video');
    vid.classList.add(videoClass);
    vid.classList.add("video-element");
    vid.autoplay = true;
    vid.muted = true;
    vid.controls = true;
    vid.id = peerId;
    videosContainer.appendChild(vid);
  }

  function setElementWidth(element, width) {
    element.setAttribute('width', width);
  }

  function createToggleStreamSizesButton() {

    var toggleSizes = document.createElement("button");
    toggleSizes.innerHTML = "Toggle";
    toggleSizes.classList.add("toggle-button");
    toggleSizes.classList.add("button-hidden");
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
