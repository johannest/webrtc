package org.vaadin.webrtc;

import com.vaadin.annotations.JavaScript;
import com.vaadin.annotations.StyleSheet;
import com.vaadin.ui.AbstractJavaScriptComponent;

@StyleSheet({ "vaadin://webrtc/style.css" })
@JavaScript({
        "vaadin://webrtc/socket.io.js",
        "https://webrtc.github.io/adapter/adapter-latest.js",
        "vaadin://webrtc/PeerConnection.js",
        "vaadin://webrtc/webrtc-connector.js"})
public class WebRTC extends AbstractJavaScriptComponent {

    private static final String RESIZE_SELF_WIDTH_METHOD = "resizeSelfWidth";
    private static final String RESIZE_PEER_WIDTH_METHOD = "resizePeerWidth";

    public WebRTC() {
    }

    @Override
    public void attach() {
        super.attach();
        addFunction("connected", args -> {
            System.out.println("connected:"+args.toJson());
        });
        addFunction("streamStarted", args -> {
            System.out.println("streamStarted:" + args.toJson());
        });
        addFunction("streamEnded", args -> {
            System.out.println("streamEnded:" + args.toJson());
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

    /**
     * Sets the size of the user's webcam element
     * @param width width of the webcam element. Should contain the value and
     */
    public void setOwnCameraWidth(String width) {
        callFunction(RESIZE_SELF_WIDTH_METHOD, width);
    }

    /**
     * Sets the size of the user's webcam element
     * @param width width of the element
     * @param unit unit of the width
     */
    public void setOwnCameraWidth(final float width, final Unit unit) {
        callFunction(RESIZE_SELF_WIDTH_METHOD, formatWidth(width, unit));
    }

    /**
     * Sets the size of the peer web camera element
     * @param width new width for the peer web camera element
     */
    public void setPeerCameraWidth(String width) {
        callFunction(RESIZE_PEER_WIDTH_METHOD, width);
    }

    /**
     * Sets the size of the peer web camera element
     * @param width new value for the peer web camera element width
     * @param unit unit of the width
     */
    public void setPeerCameraWidth(final float width, final Unit unit) {
        callFunction(RESIZE_PEER_WIDTH_METHOD, formatWidth(width, unit));
    }

    private String formatWidth(final float width, final Unit unit) {
        return String.format("%f%s", width, unit.getSymbol());
    }

}
