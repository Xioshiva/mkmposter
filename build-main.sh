#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist

# Copy main.js to dist/main.js
cp main.js dist/main.js

echo "Electron main process built successfully"