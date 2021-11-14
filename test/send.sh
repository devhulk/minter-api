#!/bin/bash

curl -X POST -H "Content-Type: application/json" \
    -d @testID4.json \
    http://localhost:3572/v1/cardano/mint/asset | jq