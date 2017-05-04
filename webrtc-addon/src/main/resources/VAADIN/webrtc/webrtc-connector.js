window.org_vaadin_webrtc_WebRTC =
    function () {
        var self = this;
        var element = this.getElement();
        var videosContainer = document.createElement("div");
        videosContainer.id = "videos-container";
        element.appendChild(videosContainer);
        var peer;

        this.onStateChange = function () {
        };

        this.connect = function (username, roomid) {
            var channel = roomid;
            var sender = username;
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

                setTimeout(function() {
                    getUserMedia(function (stream) {
                        peer.addStream(stream);
                        peer.sendParticipationRequest(userid);
                    });
                }, 500);
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
                scaleVideos();
            };

            peer.onStreamEnded = function(e) {
                self.streamEnded(e.userid);
                console.log("onStreamEnded: "+e);
                var video = e.mediaElement;
                if (video) {
                    video.style.opacity = 0;
                    rotateVideo(video);
                    setTimeout(function() {
                        video.parentNode.removeChild(video);
                        scaleVideos();
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

        function scaleVideos() {
            var videos = document.querySelectorAll('video'),
                length = videos.length, video;
            var minus = 130;
            var windowHeight = 700;
            var windowWidth = 600;
            var windowAspectRatio = windowWidth / windowHeight;
            var videoAspectRatio = 4 / 3;
            var blockAspectRatio;
            var tempVideoWidth = 0;
            var maxVideoWidth = 0;
            for (var i = length; i > 0; i--) {
                blockAspectRatio = i * videoAspectRatio / Math.ceil(length / i);
                if (blockAspectRatio <= windowAspectRatio) {
                    tempVideoWidth = videoAspectRatio * windowHeight / Math.ceil(length / i);
                } else {
                    tempVideoWidth = windowWidth / i;
                }
                if (tempVideoWidth > maxVideoWidth)
                    maxVideoWidth = tempVideoWidth;
            }
            for (var i = 0; i < length; i++) {
                video = videos[i];
                if (video)
                    video.width = maxVideoWidth - minus;
            }
        }
        window.onresize = scaleVideos;
        // you need to capture getUserMedia yourself!
        function getUserMedia(callback) {
            var hints = {audio:true,video:{
                optional: [],
                mandatory: {}
            }};
            navigator.getUserMedia(hints,function(stream) {
                var video = document.createElement('video');
                video.src = URL.createObjectURL(stream);
                video.controls = true;
                video.muted = true;
                peer.onStreamAdded({
                    mediaElement: video,
                    userid: 'self',
                    stream: stream
                });
                callback(stream);
            });
        }
    };
