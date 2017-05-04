package org.vaadin.webrtc;

import com.vaadin.annotations.JavaScript;
import com.vaadin.annotations.*;
import com.vaadin.ui.*;

@StyleSheet({ "vaadin://webrtc/style.css" })
@JavaScript({
        "vaadin://webrtc/socket.io.js",
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

    @Override
    protected WebRTCState getState() {
        return (WebRTCState) super.getState();
    }

    public void connect(String username, String roomid) {
        callFunction("connect", username, roomid);
    }

    public void shareWebCam() {
        callFunction("shareWebCam");
    }
}
