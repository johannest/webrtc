#!/bin/bash

echo "starting signaler..."
DEBUG=socket.io* node ./node_modules/socketio-over-nodejs/signaler.js
