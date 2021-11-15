const { spawn, exec } = require('child_process');
import { resolve } from 'dns';
import { exit, stderr } from 'process';
const fs = require('fs');
import Metadata from '../Metadata'
import Repo from '../Repo';

export default class Minter {
    constructor() {}


    // mint(req) {
    //     let promise = new Promise((resolve, reject) => {
    //         let mintData = req.body

    //         this.getProtocolParams(mintData)
    //     })
    //     return promise
    // }
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


    getProtocolParams (options) {
    // 3. Get protocol params
        
        let promise = new Promise((resolve, reject) => {

            let config = options.request.config 
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            const params = spawn('cardano-cli', ['query', 'protocol-parameters', network, magic])

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
                console.error("Error: ", data)
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
                            this.getMetaData(mintData)
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
                                            // .then(() => {
                                            //     // insert mint into mongodb
                                            //     let repo = new Repo
                                            //     repo.insertMintedNFT(mintData)
                                            //     .then((repoData) => {
                                            //         repoData.client.close()
                                            //         let result = repoData.result
                                            //         repo.getMintedNFTs(result)
                                            //         .then((repoData) => {
                                            //             repoData.client.close()
                                            //             let result = repoData.result
                                            //             resolve(result)
                                            //         })
                                            //         .catch((e) => reject(`Error: ${e}`))

                                            //     })
                                            //     .catch((e) => reject(`Error: ${e}`))
                                            // })
                                            // .catch((e) => reject(`Error: ${e}`))
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
                                    console.log(mintData)
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
                .catch((e) => reject(e))

            })
            .catch((e) => reject(e))
            


        return promise

    }


    getMintWalletHash(options) {
        let promise = new Promise((resolve, reject) => {

            let config = options.config
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            let validTX = {}
            exec(`cardano-cli query utxo --address $(cat mintWallet/${options.walletName}/payment.addr) ${network} ${magic} --out-file=txixhash.json`, (err, stdout, stderr) => {
                if (err) {
                    reject(err)
                    return;
                }
                let file = fs.readFileSync('txixhash.json')
                let data = JSON.parse(file)
                for (const utxo in data) {
                    let info = data[utxo]
                    if ((info.value.lovelace / 1000000) >= 10) {
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
        let dataHandler = new Metadata({policy_id: id, asset_id: data.request.metadata.name, asset_name: data.request.metadata.id, ipfsLink: data.request.metadata.image, traits: data.request.metadata.traits, amount: data.request.metadata.amount})
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
tokenname="${options.request.metadata.name}"
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
            let cmd = `cardano-cli transaction sign --signing-key-file mintWallet/${options.mintWalletInfo.name}/payment.skey --signing-key-file policy/policy.skey ${network} ${magic} --tx-body-file ./transactions/raw/${options.request.metadata.asset_id}.raw --out-file ./transactions/signed/${options.request.metadata.asset_id}.signed`
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
                }
                resolve(stdout)

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
            exec(`cardano-cli query utxo --address $(cat mintWallet/${options.mintWalletInfo.name}/payment.addr) ${network} ${magic} --out-file=minttxixhash.json`, (err, stdout, stderr) => {
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
            let minterOutput = options.sendData.output == undefined ? "0" : options.output - sendFee - 3000000
            options.sendData.output = minterOutput
            console.log(options)
            console.log("MINT Output: ", minterOutput)
            console.log("fee: ", sendFee)

                let cmd = `
#!/bin/bash

## Token Data and PolicyID
tokenamount="${options.request.metadata.amount}"
tokenname="${options.request.metadata.asset_id}"
policyid="${options.policy.id.trim()}"

## Mint Wallet Info (UTXO)
mintaddr="${options.mintWalletInfo.address}"
txix="${options.sendData.mintTXHash.txixhash}"
minterOutput="${minterOutput}"
minterFee="${sendFee}"


## Customer Wallet Info (UTXO)

customerAddr="${options.customer.address}"
customerOutput="3000000"


cardano-cli transaction build-raw --fee "${sendFee}" --tx-in ${options.sendData.mintTXHash.txixhash} --tx-out ${options.customer.address}+3000000+"1 ${options.policy.id.trim()}.${options.request.metadata.asset_id}" --tx-out ${options.mintWalletInfo.address}+${minterOutput} --out-file ./transactions/raw/${options.request.metadata.asset_id}-send.raw`
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

    finalizeSendTX(options) {
        let promise = new Promise((resolve, reject) => {
            let config = options.request.config
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction sign --signing-key-file mintWallet/${options.mintWalletInfo.name}/payment.skey ${network} ${magic} --tx-body-file ./transactions/raw/${options.request.metadata.asset_id}-send.raw --out-file ./transactions/signed/${options.request.metadata.asset_id}-send.signed`
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
            let cmd = `cardano-cli transaction submit --tx-file ./transactions/signed/${options.request.metadata.asset_id}send.signed ${network} ${magic}`
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

    sendProtocol(options) {
        let promise = new Promise((resolve, reject) => {

            let config = options.config 
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
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

        let promise = new Promise((resolve, reject) => {
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
            let minterFunds = mint.unspent.output
            let txhash = mint.unspent.txix
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
        let promise = new Promise((resolve, reject) => {
            let config = options.config
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction calculate-min-fee --tx-body-file ./transactions/raw/${options.tokenName}send.raw --tx-in-count 1 --tx-out-count 2 --witness-count 1 --protocol-params-file=protocol.json ${network} ${magic} | cut -d " " -f1`
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
        let promise = new Promise((resolve, reject) => {
            let config = options.config
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction sign --signing-key-file mintWallet/${options.walletName}/payment.skey ${network} ${magic} --tx-body-file ./transactions/raw/${options.tokenName}send.raw --out-file ./transactions/signed/${options.tokenName}send.signed`
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
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            let cmd = `cardano-cli transaction submit --tx-file ./transactions/signed/${options.tokenName}send.signed ${network} ${magic}`
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