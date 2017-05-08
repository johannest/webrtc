package org.vaadin.webrtc;

import com.vaadin.annotations.JavaScript;
import com.vaadin.annotations.*;
import com.vaadin.ui.*;

@StyleSheet({ "vaadin://webrtc/style.css" })
@JavaScript({
        "vaadin://webrtc/socket.io.js",
        "https://webrtc.github.io/adapter/adapter-latest.js",
        "vaadin://webrtc/PeerConnection.js",
        "vaadin://webrtc/webrtc-connector.js"})
public class WebRTC extends AbstractJavaScriptComponent {

    public WebRTC() {
    }

    @Override
    public void attach() {
        super.attach();
        addFunction("connected", args -> {
            System.out.println("connected:"+args.toJson());
        });
        addFunction("streamStarted", args -> {
            System.out.println("streamStarted:"+args.toJson());
        });
        addFunction("streamEnded", args -> {
            System.out.println("streamEnded:"+args.toJson());
        });
    }

    /**
     * Open a peer-to-peer connection through the signaling server
     * @param userId
     * @param channelId
     */
    public void connect(String userId, String channelId) {
        callFunction("connect", userId, channelId);
    }

    /**
     * Start web cam sharing
     */
    public void shareWebCam() {
        callFunction("shareWebCam");
    }

    /**
     * Disconnect
     */
    public void disconnect() {
        callFunction("disconnect");
    }

    @Override
    protected WebRTCState getState() {
        return (WebRTCState) super.getState();
    }


}
