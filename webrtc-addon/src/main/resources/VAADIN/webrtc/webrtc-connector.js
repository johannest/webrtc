'use strict';
/**
 * Source code modified from code of
 * https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socket.io
 * and
 * https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/gum/js/main.js
 */
window.org_vaadin_webrtc_WebRTC = function() {
  var self = this;
  var element = this.getElement();

  var container = document.createElement("div");
  container.setAttribute("class", "flex-container  container");

  var videosContainer = document.createElement("div");
  videosContainer.id = "videos-container";
  videosContainer.setAttribute("class", "flex-container video-container");
  container.appendChild(videosContainer);

  var toggleSizesButton = createToggleStreamSizesButton();

  container.appendChild(toggleSizesButton);
  element.appendChild(container);

  var peer;
  var selfId;
  var peerId;
  var wasDisconnected = false;
  var selfElementWidth = "30%";
  var peerElementWidth = "70%";

  this.connect = function(username, roomid) {
    var that = this;
    var channel = roomid;
    var sender = username;
    selfId = username;
    var SIGNALING_SERVER = 'http://' + document.domain + ':8888/';

    var isInitiator = false;
    var isChannelReady = false;

    var socket = io.connect(SIGNALING_SERVER);

    if (roomid !== '') {
      socket.emit('create or join', roomid);
      console.log('Attempted to create or  join room', roomid);
    }

    socket.on('created', function(room) {
      console.log('Created room ' + room);
      isInitiator = true;
    });

    socket.on('join', function (room){
      console.log('Another peer made a request to join room ' + room);
      isChannelReady = true;
    });

    socket.on('joined', function(room) {
      console.log('joined: ' + room);
      isChannelReady = true;

      // create peer connection
      peer = new PeerConnection(that, socket, 'message', username);

      peer.onUserFound = function(userid) {
        console.log("onUserFound: " + userid);
        peerId = userid;
        self.connected(userid);
        peer.sendParticipationRequest(userid);
      };

      peer.onStreamAdded = function(e) {
        var userId = e.userid || e.participantid;
        self.streamStarted(userId);
        console.log("onStreamAdded: " + e);

        var video = document.getElementById(userId);
        if (video && wasDisconnected) {
          wasDisconnected = false;
          console.log("re-streaming");
          video.srcObject = e.mediaElement.srcObject;
        }
        if (!video) {
          var video = e.mediaElement;
          video.id = userId;
          if (e.userid) {
            video.setAttribute("class", "video-element self-stream");
            setElementWidth(video, selfElementWidth);
          } else {
            video.setAttribute("class", "video-element peer-stream");
            setElementWidth(video, peerElementWidth);
          }

          videosContainer.insertBefore(video, videosContainer.firstChild);
          if (videosContainer.childElementCount > 1) {
            toggleSizesButton.classList.remove("button-hidden");
          }
          video.play();
        }
      };

      peer.onStreamEnded = function(e) {
        self.streamEnded(e.userid);
        console.log("onStreamEnded: " + e);
        var video = e.mediaElement;
        if (video) {
          video.style.opacity = 0;
          setTimeout(function() {
            video.parentNode.removeChild(video);
          }, 1000);
        }
      };
    });

    socket.on('full', function(room) {
      console.log('Room ' + room + ' is full');
      alert('Room ' + room + ' is full. Please try again later!');
    });

    socket.on('disconnect', function() {
      console.log("socket.io: disconnect");
    });

    socket.on('error', function(e) {
      console.log("socket.io: error: " + e);
    });

    socket.customSend = function(message) {
      socket.send({
        sender: sender,
        data: message
      });
    };

    socket.on('log', function(array) {
      console.log.apply(console, array);
    });

    this.disconnectionHappened = function() {
      console.warn("disconnectionHappened");
      wasDisconnected = true;
      peer.sendParticipationRequest(peerId);
    };

  };

  this.shareWebCam = function() {
    getUserMedia(function(stream) {
      peer.addStream(stream);
      peer.startBroadcasting();
    });
  };

  this.disconnect = function() {
    peer.close();
  };

  this.resizeSelfWidth = function(width) {
    selfElementWidth = width;
    var element = document.getElementById(selfId);
    if (element) {
      setElementWidth(element, width);
    }
  };

  this.resizePeerWidth = function(width) {
    peerElementWidth = width;
    var videos = document.getElementsByTagName('video');
    for (var index = 0; index < videos.length; index++) {
      var video = videos[index];
      if (video.id !== selfId) {
        setElementWidth(video, width);
      }
    }
  };

  function setElementWidth(element, width) {
    element.setAttribute('width', width);
  }

  function handleError(error) {
    console.log("-- handleError --");
    console.log(error);
  }

  function handleSuccess(stream, callback) {
    console.log('Got stream with constraints:', constraints);
    stream.oninactive = function() {
      console.log('Stream inactive');
    };
    window.stream = stream; // make variable available to browser console

    var video = document.createElement('video');
    video.id = selfId;
    video.srcObject = stream;
    video.controls = true;
    video.muted = true;
    peer.onStreamAdded({mediaElement: video, userid: selfId, stream: stream});
    callback(stream);
  }

  function getUserMedia(callback) {
    var constraints = window.constraints = {
      audio: false,
      video: true
    };
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      handleSuccess(stream, callback);
    }).catch(handleError);
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
