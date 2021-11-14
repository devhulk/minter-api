#!/bin/bash

curl -X POST -H "Content-Type: application/json" \
    -d @testID5.json \
    http://localhost:3572/v1/cardano/mint/sendAsset | jq