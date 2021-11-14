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
    -d '{"address": "addr_test1vpfvdy0rvkawm6zz4l3y5fykyagp5r7g300xv7dhrkxs4aq8mt5vq", "config": "testnet", "metadata": { "asset_id": "testID", "asset_name": "testName", "ipfsLink": "ipfs://test", "amount": "1", "traits": [{"head" : "original"}] }}' \
    http://localhost:3572/v1/cardano/mint/asset | jq

# Test second mint asset endpoint
curl -X POST -H "Content-Type: application/json" \
    -d '{"address": "addr_test1vpfvdy0rvkawm6zz4l3y5fykyagp5r7g300xv7dhrkxs4aq8mt5vq", "config": "testnet", "metadata": { "asset_id": "testID2", "asset_name": "testName", "ipfsLink": "ipfs://test", "amount": "1", "traits": [{"head" : "original"}] }}' \
    http://localhost:3572/v1/cardano/mint/asset | jq

# Test third mint asset endpoint
curl -X POST -H "Content-Type: application/json" \
    -d '{"address": "addr_test1vpfvdy0rvkawm6zz4l3y5fykyagp5r7g300xv7dhrkxs4aq8mt5vq", "config": "testnet", "metadata": { "asset_id": "testID3", "asset_name": "testName", "ipfsLink": "ipfs://test", "amount": "1", "traits": [{"head" : "original"}] }}' \
    http://localhost:3572/v1/cardano/mint/asset | jq

# Get utxos on address -> returns tx hash
curl -X POST -H "Content-Type: application/json" \
    -d '{"mintWalletAddr": "addr_test1vpfvdy0rvkawm6zz4l3y5fykyagp5r7g300xv7dhrkxs4aq8mt5vq", "config": "testnet" }' \
    http://localhost:3572/v1/cardano/address/payments | jq

# Get mints
curl -X POST -H "Content-Type: application/json" \
    -d '{"mintWalletAddr": "addr_test1vpfvdy0rvkawm6zz4l3y5fykyagp5r7g300xv7dhrkxs4aq8mt5vq", "config": "testnet" }' \
    http://localhost:3572/v1/cardano/address/mints | jq


# Use tx hash to get inputs and outputs
curl -X POST -H "Content-Type: application/json" \
    -d '{"mintWalletTX": "68f1a29a214276792203373991150ab6e76ebb15c6861fec453cdb171c64622a", "config": "testnet" }' \
    http://localhost:3572/v1/cardano/txs/utxos