package org.vaadin.webrtc;

import com.vaadin.annotations.*;
import com.vaadin.server.*;
import com.vaadin.ui.*;

import javax.servlet.annotation.*;

/**
 * This UI is the application entry point. A UI may either represent a browser window 
 * (or tab) or some part of a html page where a Vaadin application is embedded.
 * <p>
 * The UI is initialized using {@link #init(VaadinRequest)}. This method is intended to be 
 * overridden to add component to the user interface and initialize non-component functionality.
 */
@Theme("mytheme")
@Push
public class MyUI extends UI {

    @Override
    protected void init(VaadinRequest vaadinRequest) {
        final VerticalLayout layout = new VerticalLayout();
        final HorizontalLayout hl = new HorizontalLayout();
        final HorizontalLayout streamLayout = new HorizontalLayout();

        final TextField name = new TextField();
        name.setCaption("User identifier:");
        name.setValue(String.valueOf(1000000000l + (long)(Math.random() * 1000000000.0)));

        final TextField roomNumber = new TextField();
        roomNumber.setCaption("Room identifier:");
        roomNumber.setValue("23482023293");

        WebRTC webRTC = new WebRTC();

        Button showCamera = new Button("Show webcam", e-> {
            webRTC.showWebCam();
        });
        Button joinRoom = new Button("Join room", e-> {
            webRTC.joinRoom(name.getValue(), roomNumber.getValue());
        });
        Button leaveRoom = new Button("Leave room", e-> {
            webRTC.leaveRoom();
        });

        hl.addComponents(name,  roomNumber, showCamera, joinRoom, leaveRoom);
        hl.setComponentAlignment(showCamera, Alignment.BOTTOM_LEFT);
        hl.setComponentAlignment(joinRoom, Alignment.BOTTOM_LEFT);
        hl.setComponentAlignment(leaveRoom, Alignment.BOTTOM_LEFT);
        layout.addComponents(hl);
        layout.addComponent(streamLayout);
        streamLayout.addComponent(webRTC);

        setContent(layout);

        Slider selfSizeSlider = new Slider("Change webcam size: ", 10, 100);
        selfSizeSlider.addValueChangeListener(event -> {
            Float selectedValue = Float.valueOf(event.getValue().toString());
            webRTC.setOwnCameraWidth(selectedValue, Unit.PERCENTAGE);
            webRTC.setPeerCameraWidth(100 - selectedValue, Unit.PERCENTAGE);
        });
        streamLayout.addComponent(selfSizeSlider);
    }

    @WebServlet(urlPatterns = {"/*"}, name = "MyUIServlet", asyncSupported = true)
    @VaadinServletConfiguration(ui = MyUI.class, productionMode = false)
    public static class MyUIServlet extends VaadinServlet {
    }
}
