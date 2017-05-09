WebRTC
======
Simple Vaadin add-on for a WebRTC peer-to-peer webcam sharing

Works only in FF as-is but should work also in Chrome, Opera, and Edge if using a valid SSL certificate.

Info
====
Te main JS logic is from this WebRTC Experiment project:
https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socket.io

It has been modernized using this webrtc.org example (using adapter.js) and replacing deprecated stuff to newer ones:
https://github.com/webrtc/samples/tree/gh-pages/src/content/peerconnection/pc1

Workflow
========
To compile the entire project, run "mvn install".

To run the application, run "mvn jetty:run" on webrtc-demo directory and open http://localhost:8080/ .


Acknowledgement
===============
The project is sponsored by our consulting client.