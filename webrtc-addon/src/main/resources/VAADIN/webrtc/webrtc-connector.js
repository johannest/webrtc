/**
 * Source code modified from code of
 * https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socket.io
 * and
 * https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/gum/js/main.js
 */
window.org_vaadin_webrtc_WebRTC =
    function () {
        var self = this;
        var element = this.getElement();

        var videosContainer = document.createElement("div");
        videosContainer.id = "videos-container";
        element.appendChild(videosContainer);
        var peer;
        var selfId;
        var peerId;

        this.onStateChange = function () {
        };

        this.connect = function (username, roomid) {
            var channel = roomid;
            var sender = username;
            selfId = username;
            var SIGNALING_SERVER = 'https://webrtcweb.com:9559/';
            io.connect(SIGNALING_SERVER).emit('new-channel', {
                channel: channel,
                sender: sender
            });
            var socket = io.connect(SIGNALING_SERVER + channel);
            socket.on('connect', function () {
                // setup peer connection & pass socket object over the constructor!
                console.log("connect");
            });
            socket.send = function (message) {
                console.log("send: "+message);
                socket.emit('message', {
                    sender: sender,
                    data: message
                });
            };

            peer = new PeerConnection(socket);
            peer.userid = username;

            peer.onUserFound = function(userid) {
                if (document.getElementById(userid)) return;
                self.connected(userid);
                console.log("onUserFound: "+userid);

                    getUserMedia(function (stream) {
                        var videoTracks = stream.getVideoTracks();
                        console.log('Got stream with constraints:', constraints);
                        console.log('Using video device: ' + videoTracks[0].label);

                        peer.addStream(stream);
                        peer.sendParticipationRequest(userid);
                    });
            };

            peer.onStreamAdded = function(e) {
                if (document.getElementById(e.userid)) return;
                self.streamStarted(e.userid);
                console.log("onStreamAdded: "+e);
                var video = e.mediaElement;
                video.id = e.userid;
                video.setAttribute('width', 400);
                videosContainer.insertBefore(video, videosContainer.firstChild);
                video.play();
            };

            peer.onStreamEnded = function(e) {
                self.streamEnded(e.userid);
                console.log("onStreamEnded: "+e);
                var video = e.mediaElement;
                if (video) {
                    video.style.opacity = 0;
                    setTimeout(function() {
                        video.parentNode.removeChild(video);
                    }, 1000);
                }
            };
        };

        this.shareWebCam = function() {
            console.log("shareWebCam: ");
            getUserMedia(function(stream) {
                peer.addStream(stream);
                peer.startBroadcasting();
            });
        };

        this.disconnect = function() {
            peer.close();
        };

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
            video.id = "self";
            video.srcObject = stream;
            video.controls = true;
            video.muted = true;
            peer.onStreamAdded({
                mediaElement: video,
                userid: 'self',
                stream: stream
            });
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
    };
