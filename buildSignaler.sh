#!/bin/bash

echo "moving into 'signaling-server-src'..."
cd ./signaling-server-src

echo "removing old artifact..."
rm socketio-over-nodejs-*

echo "packaging..."
npm pack

echo "removing node_modules..."
rm -rf ../node_modules

echo "going back to parent directory..."
cd ..

echo "installing custom node module..."
npm install signaling-server-src/socketio-over-nodejs-*

echo "done..."
