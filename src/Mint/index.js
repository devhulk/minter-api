const { spawn, exec } = require('child_process');
import { stderr } from 'process';
const fs = require('fs');
import Metadata from '../Metadata'

export default class Minter {
    constructor() {}

    getProtocolParams () {
    // 3. Get protocol params
        let promise = new Promise((resolve, reject) => {

            let config = 'testnet'
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            const params = spawn('cardano-cli', ['query', 'protocol-parameters', network, magic])

            params.stdout.on('data', (data) => {
                console.log("Data: ", data)
                resolve(data)
            })

            params.stderr.on('data', (data) => {
                console.error("Error: ", data)
                reject(data)
            })

        })
        return promise
    }

    generatePolicy() {

    // 4. Create Policy Keys and Policy Script
    // 5. Generate PolicyID

    }

    metaData(metadata) {
    // 6. Retrieve token Metadata
    let dataHandler = new Metadata()


    }

    calculateFee() {
        // cardano-cli transaction calculate-min-fee \ 
        // --tx-body-file matx.raw \
        // --tx-in-count 1 \
        // --tx-out-count 1 \
        // --witness-count 2 \
        // --mainnet \
        // --protocol-params-file protocol.json | cut -d " " -f1
    }

    getHash(options) {
        let promise = new Promise((resolve, reject) => {

            let config = options.config
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            exec(`cardano-cli query utxo --address ${options.address} ${network} ${magic} --out-file=txixhash.json`, (err, stdout, stderr) => {
                if (err) {
                    reject(err)
                    return;
                }
                let file = fs.readFileSync('txixhash.json')
                let data = JSON.parse(file)
                let txixhash = Object.keys(data)[0]

                resolve(txixhash)
                return;
            })
        })
        return promise



    }

    submitTransaction() {
    // 7. Build Raw TX -> Calculate Fee -> Sign TX -> Submit TX
    //     cardano-cli transaction build-raw \
    // --fee $fee  \
    // --tx-in $txhash#$txix  \
    // --tx-out $address+$output+"$tokenamount $policyid.$tokenname" \
    // --mint="$tokenamount $policyid.$tokenname" \
    // --minting-script-file $script \
    // --metadata-json-file metadata.json  \
    // --invalid-hereafter $slotnumber \
    // --out-file matx.raw
        let promise = new Promise((resolve, reject) => {

            // let config = 'testnet'
            // let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            // let magic = network == '--testnet-magic' ? '1097911063' : ''
            const params = spawn('cardano-cli', ['transaction', 'build-raw', '--fee', `${this.calculateFee()}`, '--tx-in', `${this.txhash}#${this.txix}`])

            params.stdout.on('data', (data) => {
                console.log("Data: ", data)
                resolve(data)
            })

            params.stderr.on('data', (data) => {
                console.error("Error: ", data)
                reject(data)
            })

        })
        return promise

    }

    // Steps to Mint
    // 1. Create Wallet with Payment Address
    // 2. Fund Wallet
    // 3. Get protocol params
    // 4. Create Policy Keys and Policy Script
    // 5. Generate PolicyID
    // 6. Retrieve token Metadata
    // 7. Build Raw TX -> Calculate Fee -> Sign TX -> Submit TX
}