const { spawn, exec } = require('child_process');
import { resolve } from 'dns';
import { exit, stderr } from 'process';
const fs = require('fs');
import Metadata from '../Metadata'

export default class Minter {
    constructor() {}


    mint(req) {
        let promise = new Promise((resolve, reject) => {
                let body = req.body
                let mintData = {request: req.body}
                this.getProtocolParams()
                .then((data) => {
                    mintData.protocolParams = data
                })
                .then(() => {
                    this.getMintWalletHash(body)
                    .then((data) => {
                        mintData.mintWalletInfo = data
                    })
                    .then(() => {
                        this.getPolicyID()
                        .then((policy) => {
                            mintData.policy = policy
                        })
                        .then(() => {
                            this.getMetaData(mintData)
                            .then((metadata) => {
                                mintData.metadata = metadata
                            })
                            .then(() => {
                                this.buildRawTransaction(mintData)
                                .then((data) => {
                                    mintData.output = 0
                                })
                                .then(() => {
                                    this.calculateFee(mintData)
                                    .then((data) => {
                                        mintData.fee = data.trim()
                                        this.buildRawTransaction(mintData)
                                        .then((data) => {
                                            mintData.output = mintData.mintWalletInfo.balance.lovelace - mintData.fee
                                            console.log(mintData)
                                            this.finalizeTransaction(mintData)
                                            .then(() => {
                                                resolve(mintData)
                                            })
                                            .catch((e) => reject(`Error: ${e}`))
                                        })
                                        .catch((e) => reject(`Error: ${e}`))
                                    })
                                    .catch((e) => reject(`Error: ${e}`))
                                })
                                .catch((e) => reject(`Error: ${e}`) )
                            })
                        })
                        .catch((e) => reject(`Error: ${e}`))
                    .catch((e) => reject(`Error: ${e}`))
                    })
                })
                .catch((e) => reject(e))

        })

        return promise
    }

    send(mintData) {

        let promise = new Promise((resolve, reject) => {

            this.getMintedAssetHash(mintData)
            .then((mintTXHash) => {
                mintData.sendData = {}
                mintData.sendData.mintTXHash = mintTXHash
                mintData.sendData.output = "0"
                // this.calculateSendFee(mintData)
                // .then((sendFee) => {
                //     mintData.sendData.fee = sendFee
                    this.buildSendRawTX(mintData)
                    .then(() => {
                        this.calculateSendFee(mintData)
                        .then((sendFee) => {
                            mintData.sendData.fee = sendFee.trim()
                            // console.log(mintData.sendData.mintTXHash.balance)
                            this.buildSendRawTX(mintData)
                            .then(() => {
                                this.finalizeSendTX(mintData)
                                .then(() => {
                                    resolve(mintData) 
                                })
                                .catch((e) => reject(e))
                            })
                            .catch((e) => reject(e))
                        })
                        .catch((e) => reject(e))
                    })
                    .catch((e) => reject(e))
                // })
                // .catch((e) => reject(e))
            })
            .catch((e) => reject(e))
        })

        return promise

    }

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

    getMintWalletHash(options) {
        let promise = new Promise((resolve, reject) => {

            let config = options.config
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            let validTX = {}
            exec(`cardano-cli query utxo --address $(cat mintWallet/payment.addr) ${network} ${magic} --out-file=txixhash.json`, (err, stdout, stderr) => {
                if (err) {
                    reject(err)
                    return;
                }
                let file = fs.readFileSync('txixhash.json')
                let data = JSON.parse(file)
                for (const utxo in data) {
                    let info = data[utxo]
                    if ((info.value.lovelace / 1000000) >= 5) {
                        validTX[utxo] = info  
                    }
                }
                let balanceObj = validTX[`${Object.keys(validTX)[0]}`]
                let lovelace = balanceObj.value.lovelace
                let ada = balanceObj.value.lovelace / 1000000
                let returnObj = {txixhash: Object.keys(validTX)[0], balance: {lovelace, ada}, address: options.address }

                resolve(returnObj)
                return;
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

    calculateFee(options) {
        let promise = new Promise((resolve, reject) => {
            let config = options.request.config
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction calculate-min-fee --tx-body-file ./transactions/raw/${options.request.metadata.asset_id}.raw --tx-in-count 1 --tx-out-count 1 --witness-count 2 --protocol-params-file=protocol.json ${network} ${magic} | cut -d " " -f1`
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject(err)
                    return;
                }

                resolve(stdout)
                return;
            })

        })

        return promise

    }


    buildRawTransaction(options) {
        let output = options.output == undefined ? "0" : options.mintWalletInfo.balance.lovelace - options.fee
        let fee = options.fee == undefined ? "0" : options.fee
        let promise = new Promise((resolve, reject) => {
            //  --out-file /transactions/raw/${option.metadata.asset_id}.raw
            //address="${options.mintWalletInfo.address}"
            let cmd = `
#!/bin/bash

fee="${fee}"
txix="${options.mintWalletInfo.txixhash}"
address="${options.mintWalletInfo.address}"
output="${output}"
tokenamount="${options.request.metadata.amount}"
policyid="${options.policy.id.trim()}"
tokenname="${options.request.metadata.asset_id}"
slotnumber="${options.policy.slotnumber}"

cardano-cli transaction build-raw --fee $fee --tx-in $txix --tx-out $address+$output+"$tokenamount $policyid.$tokenname" --mint="$tokenamount $policyid.$tokenname" --minting-script-file policy/policy.script --minting-script-file policy/policy.script --invalid-hereafter $slotnumber --out-file ./transactions/raw/$tokenname.raw`
            console.log(cmd)
            exec(cmd , (err, stdout, stderr) => {
                if (err) {
                    // console.log(err)
                    reject(err)
                    return;
                }
                    resolve(stdout)
            })
        })

        return promise

    }

    finalizeTransaction(options) {
        let promise = new Promise((resolve, reject) => {
            let config = options.config
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction sign --signing-key-file mintWallet/payment.skey --signing-key-file policy/policy.skey ${network} ${magic} --tx-body-file ./transactions/raw/${options.request.metadata.asset_id}.raw --out-file ./transactions/signed/${options.request.metadata.asset_id}.signed`
            console.log(cmd)
            exec(cmd , (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                    reject(err)
                    return;
                }
                // console.log(options)
                this.submitTransaction(options)
                .then((data) => {
                    resolve(data)
                })
                .catch(e => reject(e))
                return

            })
            
        })
        return promise

    }

    submitTransaction(options) {
        let promise = new Promise((resolve, reject) => {
            let config = options.request.config
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction submit --tx-file ./transactions/signed/${options.request.metadata.asset_id}.signed ${network} ${magic}`
            console.log(cmd)
            exec(cmd , (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                    reject(err)
                    return;
                }
                resolve(stdout)
                return

            })
            
        })
        return promise

    }

    getMintedAssetHash(options) {
        let promise = new Promise((resolve, reject) => {

            let config = options.request.config
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            let validTX = {}
            exec(`cardano-cli query utxo --address $(cat mintWallet/payment.addr) ${network} ${magic} --out-file=minttxixhash.json`, (err, stdout, stderr) => {
                if (err) {
                    reject(err)
                    return;
                }
                let file = fs.readFileSync('minttxixhash.json')
                let data = JSON.parse(file)
                for (const utxo in data) {
                    let info = data[utxo]
                    // console.log(info)
                    let policyID = options.policy.id.trim()
                    if (info.value[policyID]) {
                        // console.log(info)
                        validTX[utxo] = info  
                        break;
                    }
                }
                let balanceObj = validTX[`${Object.keys(validTX)[0]}`]
                let lovelace = balanceObj.value.lovelace
                let ada = balanceObj.value.lovelace / 1000000
                let returnObj = {txixhash: Object.keys(validTX)[0], balance: {lovelace, ada}, address: options.mintWalletInfo.address }
                console.log(returnObj)

                resolve(returnObj)
                return;
            })
        })
        return promise



    }
    calculateSendFee(options) {
        let promise = new Promise((resolve, reject) => {
            let config = options.config
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction calculate-min-fee --tx-body-file ./transactions/raw/${options.request.metadata.asset_id}-send.raw --tx-in-count 1 --tx-out-count 2 --witness-count 1 --protocol-params-file=protocol.json ${network} ${magic} | cut -d " " -f1`
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject(err)
                    return;
                }
                console.log(stdout)

                resolve(stdout)
                return;
            })

        })

        return promise


    }

    buildSendRawTX(options) {
        let promise = new Promise((resolve, reject) => {
            let sendFee = options.sendData.fee == undefined ? "0" : options.sendData.fee
            let minterOutput = options.sendData.output == undefined ? "0" : options.sendData.mintTXHash.balance.lovelace - sendFee - 2000000
            console.log(options)
            console.log("MINT Output: " minterOutput)

                let cmd = `
                #!/bin/bash

                ## Token Data and PolicyID
                tokenamount="${options.request.metadata.amount}"
                tokenname="${options.request.metadata.asset_id}"
                policyid="${options.policy.id.trim()}"
                
                ## Mint Wallet Info (UTXO)
                #mintaddr="addr_test1vpfvdy0rvkawm6zz4l3y5fykyagp5r7g300xv7dhrkxs4aq8mt5vq"
                #minterFunds="14817955"
                #txhash="adee352dcdf4e5c03a71b7ec0a358c1187631e550ff8bdab192aaaa8167ba0ef"
                #txix="0"
                # minterOutput=$(expr $minterFunds - $minterFee - 2000000)
                mintaddr="${options.mintWalletInfo.address}"
                txix="${options.sendData.mintTXHash.txixhash}"
                minterOutput="${minterOutput}"
                minterFee="${sendFee}"
                
                
                ## Customer Wallet Info (UTXO)
                
                customerAddr="${options.customer.address}"
                customerOutput="2000000"

                # --tx-in $txhash#$txix  \
                
                
                cardano-cli transaction build-raw \
                    --fee $minterFee \
                    --tx-in $txix  \
                    --tx-out $customerAddr+$customerOutput+"1 $policyid.$tokenname" \
                    --tx-out $mintaddr+$minterOutput \
                    --out-file ./transactions/raw/${options.request.metadata.asset_id}-send.raw
                `
                exec(cmd , (err, stdout, stderr) => {
                    if (err) {
                        reject(err)
                        return;
                    }
                        resolve(stdout)
                })

            })

            return promise

    }

    finalizeSendTX(options) {
        let promise = new Promise((resolve, reject) => {
            let config = options.config
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction sign --signing-key-file mintWallet/payment.skey ${network} ${magic} --tx-body-file ./transactions/raw/${options.request.metadata.asset_id}-send.raw --out-file ./transactions/signed/${options.request.metadata.asset_id}-send.signed`
            // console.log(cmd)
            exec(cmd , (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                    reject(err)
                    return;
                }
                // console.log(options)
                this.submitTransaction(options)
                .then((data) => {
                    resolve(stdout)
                })
                .catch(e => reject(e))
                return

            })
            
        })
        return promise

    }

    submitSendTX(options) {
        let promise = new Promise((resolve, reject) => {
            let config = options.request.config
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction submit --tx-file ./transactions/signed/${options.request.metadata.asset_id}-send.signed ${network} ${magic}`
            // console.log(cmd)
            exec(cmd , (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                    reject(err)
                    return;
                }
                resolve(stdout)
                return

            })
            
        })
        return promise

    }

}