#!/bin/bash

txi=$1
utxo_balance=$2

echo 'getting protocol params...'
cardano-cli query protocol-parameters \
    --mainnet \
    --out-file protocol.json

echo 'building raw transaction...'

cardano-cli transaction build-raw \
    --tx-in $txi \
    --tx-out $(cat payment_address)+0 \
    --tx-out $(cat wallet_address)+0 \
    --invalid-hereafter 0 \
    --fee 0 \
    --out-file tx.draft

echo 'calculating fee...'

raw_fee=$(cardano-cli transaction calculate-min-fee \
    --tx-body-file tx.draft \
    --tx-in-count 1 \
    --tx-out-count 2 \
    --witness-count 1 \
    --byron-witness-count 0 \
    --mainnet \
    --protocol-params-file protocol.json)


fee_array=($raw_fee)
fee=${fee_array[0]}

echo 'calculating amount to send...'
amount_to_send=$(expr $utxo_balance - $fee)

echo 'grabbing current slot...'
slot=$(cardano-cli query tip --mainnet | jq '.slot')

echo 'adding 200 slots...'
invalid_hereafter=$(expr $slot + 200)

echo 'building finalized transaction...'

cardano-cli transaction build-raw \
    --tx-in $txi \
    --tx-out $(cat payment_address)+$amount_to_send \
    --invalid-hereafter $invalid_hereafter \
    --fee $fee \
    --out-file tx.raw

echo 'signing transaction...'
cardano-cli transaction sign \
    --tx-body-file tx.raw \
    --signing-key-file ../mintWallet/mainOne/payment.skey \
    --mainnet \
    --out-file tx.signed

result=$(cardano-cli transaction submit \
    --tx-file tx.signed \
    --mainnet)

echo $result
