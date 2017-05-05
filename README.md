WebRTC
======
Simple Vaadin add-on for a WebRTC peer-to-peer webcam sharing

Works only in FF as-is but should work also in Chrome and Edge if using a valid SSL certificate.

Workflow
========

To compile the entire project, run "mvn install".

To run the application, run "mvn jetty:run" and open http://localhost:8080/ .

To produce a deployable production mode WAR:
- change productionMode to true in the servlet class configuration (nested in the UI class)
- run "mvn clean package"
- test the war file with "mvn jetty:run-war"

Acknowledgement
===============
The project is sponsored by our consulting client.