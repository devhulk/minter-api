#!/bin/bash

# curl -X POST -H "Content-Type: application/json" \
#     -d '{"address": "addr_test1vpfvdy0rvkawm6zz4l3y5fykyagp5r7g300xv7dhrkxs4aq8mt5vq", "config": "testnet", "metadata": { "asset_id": "testID4", "asset_name": "testName", "ipfsLink": "ipfs://test", "amount": "1", "traits": [{"head" : "original"}] }}' \
#     http://localhost:3572/v1/cardano/mint/asset | jq

curl -X POST -H "Content-Type: application/json" \
    -d '{"address": "addr_test1vpfvdy0rvkawm6zz4l3y5fykyagp5r7g300xv7dhrkxs4aq8mt5vq", "config": "testnet", "metadata": { "asset_id": "testID5", "asset_name": "testName", "ipfsLink": "ipfs://test", "amount": "1", "traits": [{"head" : "original"}] }}' \
    http://localhost:3572/v1/cardano/mint/asset | jq