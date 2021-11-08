#!/bin/bash

curl -X POST -H "Content-Type: application/json" \
    -d '{}' \
    http://localhost:3572/v1/wallet
