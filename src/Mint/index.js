const { spawn, exec } = require('child_process');
import { exit, stderr } from 'process';
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
                console.log("ProtocolData: ", data)
                fs.writeFile('protocol.json', data, err => {
                    if (err) {
                        reject(err)
                    }
                })
                resolve(JSON.parse(data))
            })

            params.stderr.on('data', (data) => {
                console.error("Error: ", data)
                reject(data)
            })

        })
        return promise
    }

    getPolicyID() {
        let promise = new Promise((resolve, reject) => {
            let policyObj = {}
            fs.readFile('policy/policyID', 'utf8', (err, data) => {
                if (err) {
                    reject(err)
                    return
                }
                policyObj.id = data
                fs.readFile('policy/policy.script', 'utf8', (err, data) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    let file = JSON.parse(data)
                    policyObj.slotnumber = file.scripts[0].slot
                    
                    resolve(policyObj)
                })
            })

        })
        return promise

    }

    getMetaData(data) {
    // 6. Retrieve token Metadata
    let promise = new Promise((resolve, reject) => {
        let id = data.policy.id.trim()
        let dataHandler = new Metadata({policy_id: id, asset_id: data.request.metadata.asset_id, asset_name: data.request.metadata.asset_name, ipfsLink: data.request.metadata.ipfsLink, traits: data.request.metadata.traits, amount: data.request.metadata.amount})
        let metadata = dataHandler.format()
        fs.writeFile('metadata.json', metadata, err => {
            if (err) {
                reject(err)
            }
            
            resolve(JSON.parse(metadata))
        })
    })

    return promise


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
                let balanceObj = data[`${Object.keys(data)[0]}`]
                let lovelace = balanceObj.value.lovelace
                let ada = balanceObj.value.lovelace / 1000000
                let returnObj = {txixhash: Object.keys(data)[0], balance: {lovelace, ada}, address: options.address }

                resolve(returnObj)
                return;
            })
        })
        return promise



    }

    buildRawTransaction(options) {
        let output = "0"
        let promise = new Promise((resolve, reject) => {
            //  --mint="${options.metadata.amount} ${options.policy.id}.${options.metadata.asset_id}" \
            //  --minting-script-file policy/policy.script \
            //  --metadata-json-file metadata.json \
            //  --invalid-hereafter "${options.policy.slotnumber}" \
            //  --out-file /transactions/raw/${option.metadata.asset_id}.raw
            let cmd = `
#!/bin/bash

cardano-cli transaction build-raw --fee "0" --tx-in "${options.mintWalletInfo.txixhash}"`+`--tx-out ${options.mintWalletInfo.address}+${output}+`+`"${options.request.metadata.amount} `+`${options.policy.id}.${options.request.metadata.asset_id}"`+` --mint="${options.request.metadata.amount} ${options.policy.id}.${options.request.metadata.asset_id}"`
            console.log(cmd)
        fs.writeFile('build-raw.sh', cmd, err => {
            if (err) {
                reject(err)
            }
            
            resolve(cmd)
        })

            // exec(cmd , (err, stdout, stderr) => {
            //     if (err) {
            //         // console.log(err)
            //         reject(err)
            //         return;
            //     }
            //     resolve(stdout)

            // })




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