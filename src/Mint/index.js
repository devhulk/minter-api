const { spawn, exec } = require('child_process');
const fs = require('fs');
import { Transaction } from 'mongodb';
import Metadata from '../Metadata'
import Repo from '../Repo';

export default class Minter {
    constructor() {}

    getProtocolParams (options) {
        
        let promise = new Promise((resolve, reject) => {

            let config = options.request.config 
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : null // changing from '' to nil. If this doesn't work change to exec
            const params = spawn('cardano-cli', ['query', 'protocol-parameters', network, magic]) // deleted magic number for testnet

            params.stdout.on('data', (data) => {
                console.log("ProtocolData: ", data)
                fs.writeFile('protocol.json', data, err => {
                    if (err) {
                        reject(err)
                    }
                    let protocol = JSON.parse(data)

                    resolve(protocol)

                })
            })

            params.stderr.on('data', (data) => {
                console.error("Error: ", data.toString())
                reject(data)
            })

        })
        return promise
    }



    mint(req) {
        let promise = new Promise((resolve, reject) => {
                let body = req.body
                let mintData = {request: req.body}
                this.getProtocolParams(mintData)
                .then((data) => {
                    mintData.protocolParams = data
                    this.getMintWalletHash(body)
                    .then((data) => {
                        mintData.mintWalletInfo = data
                        mintData.mintWalletInfo.name = mintData.request.walletName
                        this.getPolicyID()
                        .then((policy) => {
                            mintData.policy = policy
                            this.createMetaData(mintData)
                            .then((metadata) => {
                                mintData.metadata = metadata
                                this.buildRawTransaction(mintData)
                                .then((data) => {
                                    mintData.output = 0
                                    this.calculateFee(mintData)
                                    .then((data) => {
                                        mintData.fee = data.trim()
                                        this.buildRawTransaction(mintData)
                                        .then((data) => {
                                            mintData.output = mintData.mintWalletInfo.balance.lovelace - mintData.fee
                                            this.finalizeTransaction(mintData)
                                            resolve(mintData)
                                            // ideally should be able to mint and send at the same time
                                            // need to make changes to metadata
                                        })
                                        .catch((e) => reject(`Error: ${e}`))
                                    })
                                    .catch((e) => reject(`Error: ${e}`))
                                })
                                .catch((e) => reject(`Error: ${e}`) )
                            })
                            .catch((e) => reject(`Error: ${e}`))
                        })
                        .catch((e) => reject(`Error: ${e}`))
                    })
                    .catch((e) => reject(e))
                })
                .catch((e) => reject(`Error: ${e}`))

        })

        return promise
    }

    deliver(req) {
        let promise = new Promise((resolve, reject) => {
            let options = req.body
            this.sendProtocol(options)
            .then((protocol) => {
                options.protocolParams = protocol
                this.sendRaw(options)
                .then((stdout) => {
                    this.sendFee(options)
                    .then((options) => {
                        this.sendRaw(options)
                        .then((stdout) => {
                            this.signSendTX(options)
                            .then((stdout) => {
                                console.log(stdout)
                                this.submitSend(options)
                                .then((status) => {
                                    console.log(status)
                                    resolve({status})
                                })
                                .catch(e => reject(e))
                            })
                            .catch(e => reject(e))

                        })
                        .catch(e => reject(e))
                    })
                    .catch(e => reject(e))
                })
                .catch(e => reject(e))
            })
            .catch(e => reject(e))
        })
        .catch(e => reject(e))

        return promise

    }



    getMintWalletHash(options) {
        let promise = new Promise((resolve, reject) => {

            // let config = options.config
            // let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            // let magic = network == '--testnet-magic' ? '1097911063' : ''
            // let validTX = {}
            // exec(`cardano-cli query utxo --address $(cat mintWallet/${options.walletName}/payment.addr) ${network} ${magic} --out-file=txixhash.json`, (err, stdout, stderr) => {
            //     if (err) {
            //         reject(err)
            //         return;
            //     }
            //     let file = fs.readFileSync('txixhash.json')
            //     let data = JSON.parse(file)
            //     for (const utxo in data) {
            //         let info = data[utxo]
            //         if ((info.value.lovelace / 1000000) >= 10) {
            //             validTX[utxo] = info  
            //         }
            //     }
            //     let balanceObj = validTX[`${Object.keys(validTX)[0]}`]
                let lovelace = utxo.unspent 
                let ada = lovelace / 1000000
                let utxo = wallet.getWalletUTXOS(req)
                .then((utxos) => {
                    let utxo = utxos[Math.floor(Math.random() * utxos.length)];
                    return utxo
                })
                //Object.keys(validTX)[0]
                let returnObj = {txixhash: utxo.txix, balance: {lovelace, ada}, address: options.address }

                resolve(returnObj)
                return;
            // })
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

    createMetaData(data) {
    // 6. Retrieve token Metadata
    let promise = new Promise((resolve, reject) => {
        let id = data.policy.id.trim()
        let dataHandler = new Metadata({policy_id: id, name: data.request.metadata.name, ticker: data.request.metadata.id, imageLink: data.request.metadata.imageLink, image: data.request.metadata.image, attributes: data.request.metadata.attributes, amount: data.request.metadata.amount})
        let metadata = dataHandler.format()
        fs.writeFile(`metadata/${data.request.metadata.name}.json`, metadata, err => {
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
            let network = config == 'testnet' ? '--testnet-magic 1097911063' : '--mainnet' // added magic number right to --testnet-magic flag
            // let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction calculate-min-fee --tx-body-file ./transactions/raw/${options.request.metadata.name}.raw --tx-in-count 1 --tx-out-count 1 --witness-count 2 --protocol-params-file=protocol.json ${network} | cut -d " " -f1` // removed magic
            exec(cmd, (err, stdout, stderr) => {
            console.log(cmd)
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
tokenname="${options.request.metadata.name}"
slotnumber="${options.policy.slotnumber}"

cardano-cli transaction build-raw --fee $fee --tx-in $txix --tx-out $address+$output+"$tokenamount $policyid.$tokenname" --mint="$tokenamount $policyid.$tokenname" --minting-script-file policy/policy.script --minting-script-file policy/policy.script --metadata-json-file metadata.json --invalid-hereafter $slotnumber --out-file ./transactions/raw/$tokenname.raw`
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
            let cmd = `cardano-cli transaction sign --signing-key-file mintWallet/${options.mintWalletInfo.name}/payment.skey --signing-key-file policy/policy.skey ${network} ${magic} --tx-body-file ./transactions/raw/${options.request.metadata.name}.raw --out-file ./transactions/signed/${options.request.metadata.name}.signed`
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
            let cmd = `cardano-cli transaction submit --tx-file ./transactions/signed/${options.request.metadata.name}.signed ${network} ${magic}`
            console.log(cmd)
            exec(cmd , (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                resolve(stdout)

            })
            
        })
        return promise

    }

    sendProtocol(options) {
        let promise = new Promise((resolve, reject) => {

            let config = options.config 
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : null // changing from '' to nil
            const params = spawn('cardano-cli', ['query', 'protocol-parameters', network, magic])

            params.stdout.on('data', (data) => {
                console.log("ProtocolData: ", data.toString())
                fs.writeFile('protocol.json', data, err => {
                    if (err) {
                        reject(err)
                    }

                    resolve(data.toString())

                })
            })

            params.stderr.on('data', (data) => {
                console.error("Error: ", data.toString())
                reject(data)
            })
        })

        return promise

    }

    sendRaw(req) {
        console.log('IN SEND RAW TX')

        let promise = new Promise((resolve, reject) => {
            // get valid utxo from wallet, update mint data 
            let wallet = new Transaction() 
            let utxo = wallet.getWalletUTXOS(req)
            .then((utxos) => {
                let utxo = utxos[Math.floor(Math.random() * utxos.length)];
                return utxo
            })

            let mint = req.mint
            let payment = req.payment
            let customerAddr = payment.customerAddress
            let walletName = req.walletName

            // let network = req.config == 'testnet' ? '--testnet-magic' : '--mainnet'
            // let magic = network == '--testnet-magic' ? '1097911063' : ''

            let walletPath = `./mintWallet/${walletName}`
            let tokenName = mint.tokenName
            let tokenAmount = mint.recieved.quantity
            let policyID = mint.policyID

            let mintAddr = mint.address
            let minterFunds = utxo.unspent //mint.unspent.output
            let txhash = utxo.txix // mint.unspent.txix
            let minterFee = !req.minterFee ? 0 : req.minterFee
            let minterOutput = minterFunds - minterFee - 2000000
            let rawMintFile = `./transactions/raw/${tokenName}send.raw`

            let cmd = `
            walletName=${walletName} 
            walletPath=${walletPath}
            tokenName=${tokenName}
            tokenAmount=${tokenAmount}
            policyID=${policyID}
            mintAddr=${mintAddr}
            minterFunders=${minterFunds}
            txhash=${txhash}
            minterFee=${minterFee}
            minterOutput=${minterOutput}
            customerAddr=${customerAddr}
            customerOutput="2000000"

            cardano-cli transaction build-raw --fee $minterFee --tx-in $txhash  --tx-out $customerAddr+$customerOutput+"1 $policyID.$tokenName" --tx-out $mintAddr+$minterOutput --out-file ${rawMintFile}
            `
            exec(cmd , (err, stdout, stderr) => {
                if (err) {
                    reject(err)
                    return;

                }
                console.log(cmd)
                    resolve(stdout)
            })

        })

        return promise
        
    }

    sendFee(options) {
        console.log('IN SEND FEE')
        let promise = new Promise((resolve, reject) => {
            let config = options.config
            let network = config == 'testnet' ? '--testnet-magic 1097911063' : '--mainnet'
            // let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction calculate-min-fee --tx-body-file ./transactions/raw/${options.mint.tokenName}send.raw --tx-in-count 1 --tx-out-count 2 --witness-count 1 --protocol-params-file=protocol.json ${network} | cut -d " " -f1`
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject(err)
                    return;
                }
                let sendFee = stdout
                options.minterFee = sendFee

                resolve(options)
                return;
            })

        })

        return promise

    }

    signSendTX(options) {
        console.log('IN SIGN SEND')
        let promise = new Promise((resolve, reject) => {
            let config = options.config
            let network = config == 'testnet' ? '--testnet-magic 1097911063' : '--mainnet'
            // let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction sign --signing-key-file mintWallet/${options.walletName}/payment.skey ${network}  --tx-body-file ./transactions/raw/${options.mint.tokenName}send.raw --out-file ./transactions/signed/${options.mint.tokenName}send.signed`
            console.log(cmd)
            exec(cmd , (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                    reject(err)
                    return;
                }
                resolve(stdout)

            })
            
        })
        return promise

    }

    submitSend(options) {
        let promise = new Promise((resolve, reject) => {
            let config = options.config
            let network = config == 'testnet' ? '--testnet-magic 1097911063' : '--mainnet'
            // let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction submit --tx-file ./transactions/signed/${options.mint.tokenName}send.signed ${network}`
            exec(cmd , (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                    reject(err)
                    return;
                }
                console.log(stdout)
                resolve(stdout)
                return

            })
            
        })
        return promise

    }
    

}