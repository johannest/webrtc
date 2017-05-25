#Signaling server for webrtc-addon and demo

Sources copied and slightly modified from: https://github.com/muaz-khan/WebRTC-Experiment 

###Package and install for development environment
1. Verify that you are in the signaling-server-src directory
2. Remove (possible) old npm package and make a new one ```rm socketio-over-nodejs-3.0.1.tgz && npm pack``` 
3. Remove (possible) old server ```rm -rf ../node_modules```
4. Install new package ```cd .. && npm install signaling-server-src/socketio-over-nodejs-3.0.1.tgz ```
5. Run server ```node ./node_modules/socketio-over-nodejs/signaler.js```