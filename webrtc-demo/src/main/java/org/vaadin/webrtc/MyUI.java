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

        Button button = new Button("Connect");
        button.addClickListener( e -> {
            webRTC.connect(name.getValue(), roomNumber.getValue());
        });

        Button webCam = new Button("Share webcam", e-> {
            webRTC.shareWebCam();
        });

        hl.addComponents(name,  roomNumber, button);
        hl.setComponentAlignment(button, Alignment.BOTTOM_LEFT);
        layout.addComponents(hl);
        layout.addComponent(webRTC);
        layout.addComponent(new HorizontalLayout(webCam));

        setContent(layout);
    }

    @WebServlet(urlPatterns = {"/*"}, name = "MyUIServlet", asyncSupported = true)
    @VaadinServletConfiguration(ui = MyUI.class, productionMode = false)
    public static class MyUIServlet extends VaadinServlet {
    }
}
