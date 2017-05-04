window.org_webrtc_vaadin_WebRTC =
    function () {
        var self = this;
        var element = this.getElement();
        var ownCamPreview = document.createElement('div');
        var otherCamPreview = document.createElement('div');

        element.appendChild(ownCamPreview);
        element.appendChild(otherCamPreview);

        var SIGNALING_SERVER = 'ws://' + document.domain + ':12034';
        var sessions = {};
        var rtcMultiConnection = new RTCMultiConnection();
        rtcMultiConnection.session = {data: true};
        rtcMultiConnection.customStreams = {};
        rtcMultiConnection.autoTranslateText = false;
        rtcMultiConnection.blobURLs = {};
        rtcMultiConnection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        };

        this.onStateChange = function () {
        };

        this.connect = function (username, roomid) {
            console.log("Connecting: " + username + ", " + roomid);

            rtcMultiConnection.extra = {
                username: username
            };
            rtcMultiConnection.channel = roomid;

            var websocket = new WebSocket(SIGNALING_SERVER);
            websocket.onmessage = function (event) {
                var data = JSON.parse(event.data);
                if (data.isChannelPresent === false) {
                    addNewMessage({
                        header: username,
                        message: 'No room found. Creating new room: ' + roomid
                    });

                    rtcMultiConnection.userid = roomid;
                    rtcMultiConnection.open({
                        dontTransmit: true,
                        sessionid: roomid
                    });
                } else {
                    addNewMessage({
                        header: username,
                        message: 'Room found. Joining the room...'
                    });
                    rtcMultiConnection.join({
                        sessionid: roomid,
                        userid: roomid,
                        extra: {},
                        session: rtcMultiConnection.session
                    });
                }
            };
            websocket.onopen = function () {
                websocket.send(JSON.stringify({
                    checkPresence: true,
                    channel: roomid
                }));
            };
        };

        this.sendAMessage = function (username, message) {
            console.warn("sendMessage: " + message);

            addNewMessage({
                userid: rtcMultiConnection.userid,
                extra: rtcMultiConnection.extra,
                header: username,
                message: message,
                userinfo: getUserinfo(rtcMultiConnection.blobURLs[rtcMultiConnection.username], 'images/info.png')
            });

            rtcMultiConnection.send(message);
        };

        this.shareWebCam = function() {
            var session = {audio: true, video: true};

            rtcMultiConnection.captureUserMedia(function (stream) {
                var streamid = rtcMultiConnection.token();

                rtcMultiConnection.customStreams[streamid] = stream;

                rtcMultiConnection.sendMessage({
                    hasCamera: true,
                    streamid: streamid,
                    session: session
                });
            }, session);
        };

        function addNewMessage(args) {
            if (args.userinfo && args.userinfo.includes("video")) {
                ownCamPreview.innerHTML = args.userinfo;
            }

            self.message(args);
        }

        rtcMultiConnection.openSignalingChannel = function (config) {
            config.channel = config.channel || this.channel;
            var websocket = new WebSocket(SIGNALING_SERVER);
            websocket.channel = config.channel;
            websocket.onopen = function () {
                websocket.push(JSON.stringify({
                    open: true,
                    channel: config.channel
                }));
                if (config.callback)
                    config.callback(websocket);
            };
            websocket.onmessage = function (event) {
                console.log(">>> onmessage >>> " + JSON.stringify(event.data));
                config.onmessage(JSON.parse(event.data));
            };
            websocket.push = websocket.send;
            websocket.send = function (data) {
                if (websocket.readyState !== 1) {
                    return setTimeout(function () {
                        websocket.send(data);
                    }, 1000);
                }

                websocket.push(JSON.stringify({
                    data: data,
                    channel: config.channel
                }));
            };
        };
        rtcMultiConnection.sendMessage = function (message) {
            message.userid = rtcMultiConnection.userid;
            message.extra = rtcMultiConnection.extra;
            rtcMultiConnection.sendCustomMessage(message);
        };

        rtcMultiConnection.onopen = function (e) {
            addNewMessage({
                header: e.extra.username,
                message: 'Data connection is opened between you and ' + e.extra.username + '.',
                userinfo: getUserinfo(rtcMultiConnection.blobURLs[rtcMultiConnection.userid], 'images/info.png')
            });
        };

        rtcMultiConnection.onmessage = function (e) {
            addNewMessage({
                header: e.extra.username,
                message: 'Text message from ' + e.extra.username + ':<br /><br />' + (rtcMultiConnection.autoTranslateText ? linkify(e.data) + ' ( ' + linkify(e.original) + ' )' : linkify(e.data)),
                userinfo: getUserinfo(rtcMultiConnection.blobURLs[e.userid], 'images/chat-message.png')
            });
        };

        rtcMultiConnection.onNewSession = function (session) {
            if (sessions[session.sessionid]) return;
            sessions[session.sessionid] = session;

            session.join();

            addNewMessage({
                header: session.extra.username,
                message: 'Making handshake with room owner....!'
            });
        };

        rtcMultiConnection.onRequest = function (request) {
            rtcMultiConnection.accept(request);
            addNewMessage({
                header: 'New Participant',
                message: 'A participant found. Accepting request of ' + request.extra.username + ' ( ' + request.userid + ' )...'
            });
        };

        rtcMultiConnection.onCustomMessage = function (message) {
            console.log("onCustomMessage");
            if (message.hasCamera) {
                console.log("hasCamera");

                setTimeout(function() {rtcMultiConnection.preview(message);}, 500);
            }

            if (message.renegotiate) {
                var customStream = rtcMultiConnection.customStreams[message.streamid];
                if (customStream) {
                    rtcMultiConnection.peers[message.userid].renegotiate(customStream, message.session);
                }
            }
        };

        rtcMultiConnection.preview = function (message) {
            console.log("preview");
            session = {audio: true, video: true};
            message.session.oneway = true;

            rtcMultiConnection.sendMessage({
                renegotiate: true,
                streamid: message.streamid,
                session: message.session
            });
        };

        rtcMultiConnection.onstream = function (e) {
            console.log("onstream");
            if (e.stream.getVideoTracks().length) {
                rtcMultiConnection.blobURLs[e.userid] = e.blobURL;

                addNewMessage({
                    header: e.extra.username,
                    message: e.extra.username + ' enabled webcam.',
                    userinfo: '<video id="' + e.userid + '" src="' + URL.createObjectURL(e.stream) + '" autoplay muted=true></vide>'
                });
            }
        };

        rtcMultiConnection.onclose = rtcMultiConnection.onleave = function (event) {
            addNewMessage({
                header: event.extra.username,
                message: event.extra.username + ' left the room.',
                userinfo: getUserinfo(rtcMultiConnection.blobURLs[event.userid], 'images/info.png')
            });
        };

        function getUserinfo(blobURL, imageURL) {
            return blobURL ? '<video src="' + blobURL + '" autoplay controls></video>' : '<img src="' + imageURL + '">';
        }
    };
