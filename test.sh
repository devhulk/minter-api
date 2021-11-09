#!/bin/bash
# Test wallet endpoint
curl -X POST -H "Content-Type: application/json" \
    -d '{}' \
    http://localhost:3572/v1/wallet

# Test mint endpoint
curl -X POST -H "Content-Type: application/json" \
    -d '{"policy_id": "", "policy_name": "", "asset_id": "", "asset_name": "", "ipfsLink": "", "traits": [] }' \
    http://localhost:3572/v1/mint