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

        final TextField name = new TextField();
        name.setCaption("User identifier:");
        name.setValue(String.valueOf(1000000000l+(long)(Math.random()*1000000000.0)));

        final TextField roomNumber = new TextField();
        roomNumber.setCaption("Channel identifier:");
        roomNumber.setValue("23482023293");

        WebRTC webRTC = new WebRTC();

        Button start = new Button("Share webcam", e-> {
            webRTC.connect(name.getValue(), roomNumber.getValue());
            webRTC.shareWebCam();
        });
        Button stop = new Button("Disconnect", e-> {
            webRTC.disconnect();
        });

        hl.addComponents(name,  roomNumber, start, stop);
        hl.setComponentAlignment(start, Alignment.BOTTOM_LEFT);
        hl.setComponentAlignment(stop, Alignment.BOTTOM_LEFT);
        layout.addComponents(hl);
        layout.addComponent(webRTC);

        setContent(layout);
    }

    @WebServlet(urlPatterns = {"/*"}, name = "MyUIServlet", asyncSupported = true)
    @VaadinServletConfiguration(ui = MyUI.class, productionMode = false)
    public static class MyUIServlet extends VaadinServlet {
    }
}
