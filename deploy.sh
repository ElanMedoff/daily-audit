#!/bin/bash

if npm run test; then
  npm run build
  git add -A 
  git commit -m "$1"
  npm run push
  npm run deploy
else
  echo "ABORTING"
fi
