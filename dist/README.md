# minter-api


## Pre-reqs

* Node-JS
* Minting Wallet - (with private key) - Wallet used to create policy id needs to be used to mint (./payment.addr + ./payment.vkey + ./payment.addr)
* Cardano Wallet Server
* ./policy folder with policy files (policy.script + policy.skey + policy.vkey + policyID)
* ./transactions/raw folder
* ./transactions/signed folder 

## Post Command Example

curl -X POST -H "Content-Type: application/json"     -d '{"address": "$mint_wallet_addr", "config": "testnet | mainnet", "metadata": { "asset_id": "testID", "asset_name": "testName", "ipfsLink": "ipfs://test", "amount": "1", "traits": [{"head" : "original"}] }}' http://localhost:3572/v1/cardano/mint/asset