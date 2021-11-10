#!/bin/bash
# Test wallet endpoint
curl -X POST -H "Content-Type: application/json" \
    -d '{}' \
    http://localhost:3572/v1/wallet

# Test wallet endpoint
curl -X POST -H "Content-Type: application/json" \
    -d '{"address": "addr_test1qzjy75c3tyyvl3t92y9404hdaqnhpcuxedqchyyuvg3phymryqfyt540zetndfm7u707afmn6ptg6vyuh7axve44sgwssgw298", "config": "testnet"}' \
    http://localhost:3572/v1/cardano/mint/getHash

# Test mint asset endpoint
curl -X POST -H "Content-Type: application/json" \
    -d '{"address": "addr_test1qzjy75c3tyyvl3t92y9404hdaqnhpcuxedqchyyuvg3phymryqfyt540zetndfm7u707afmn6ptg6vyuh7axve44sgwssgw298", "config": "testnet", "metadata": { "asset_id": "testID", "asset_name": "testName", "ipfsLink": "ipfs://test", "amount": "1", "traits": [{"head" : "original"}] }}' \
    http://localhost:3572/v1/cardano/mint/asset

# Test mint endpoint
curl -X POST -H "Content-Type: application/json" \
    -d '{"policy_id": "", "policy_name": "", "asset_id": "", "asset_name": "", "ipfsLink": "", "traits": [] }' \
    http://localhost:3572/v1/mint