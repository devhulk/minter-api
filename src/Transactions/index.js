require('dotenv').config()
import axios from 'axios'
import Repo from '../Repo'
import TXInputs from '../TXInputs/inputs'
import TXOutputs from '../TXOutputs/outputs'


export default class Transactions {
    constructor() {}

    payments(options) {
        let promise = new Promise((resolve, reject) => {
            this.getWalletTXS(options)
            .then((txs) => {
                options.txs = txs
                this.getPayments(options)
                .then((payments) => {
                    resolve(payments)
                })
            })
            .catch(e => reject(e))

        })
        return promise
    }

    utxos(options) {
        let repo = new Repo()
        let runResults = {}
        let utxoList = []
        let promise = new Promise((resolve, reject) => {
            this.getWalletTXS(options)
            .then((txs) => {
                options.txs = txs
                this.getAllUTXOS(options)
                .then((utxos) => {
                    this.parseUTXOS(utxos)
                    .then((utxos) => {
                        utxoList = utxos
                        repo.updateMintedNFTS(utxos.minted)
                        .then((results) => {
                            runResults.mintResults = results
                        })
                    })
                    .catch((e) => reject(e))
                    .then(() => {
                        repo.updatePayments(utxoList.payments)
                        .then((results) => {
                            runResults.paymentsResults = results
                        })
                        .catch((e) => reject(e))
                    })
                    .catch((e) => reject(e))
                    .then(() => {
                        repo.updateSent(utxoList.payments)
                        .then((results) => {
                            runResults.sentResults = results
                            resolve(utxoList)
                        })
                        .catch((e) => reject(e))
                    })
                    .catch(e => reject(e))
                })
                .catch(e => reject(e))
            })
            .catch(e => reject(e))

        })
        return promise
    }

    mongoUpdates(utxos) {

        // let mintResults = repo.updateMintedNFTS(utxos.minted)
        //                 .then((results) => {
        //                     runResults.mintResults = results
        //                 })

        // return Promise.all()
    }

    getAllUTXOS(options) {
            let utxos = options.txs
            // console.log("UTXOS: ", utxos)
            let txhashs = utxos.map(utxo => {
                    options.mintWalletTX = utxo["tx_hash"]
                    return this.getTXData(options).then((results) => {
                        results.output.txHash = utxo["tx_hash"]
                        results.output.inputAddress = results.address
                        results.output.unspentOutput = results.unspentOutput
                        return results.output
                    })
            })

            let allUTXOS = Promise.all(txhashs)            
            .then((utxos) => {
                // let mints = []
                // txOutputs.forEach((txOutput) => {
                    // if (txOutput.address !== options.mintWalletAddr) {
                    //     mints.push(txOutput) 
                    // }
                //     mints.push(txOutput)
                // }) 
                // return JSON.stringify(utxos)
                return utxos
            })
            .catch(function (error) { console.log(error)})

              return allUTXOS
    }

    getWalletTXS(options) {
        let promise = new Promise((resolve, reject) => {

            let blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET
            let walletTXs = []
            axios.get(`https://cardano-${options.config}.blockfrost.io/api/v0/addresses/${options.mintWalletAddr}/utxos?order=desc`, {headers: {'project_id': `${blockfrostKey}`}})
            .then((response) => {
                // console.log(response.data[0].amount)
                resolve(response.data)
            })
            .catch(e => reject(e.toJSON()))

        })

        return promise
    }

    parseUTXOS(utxos) {
        console.log('inside parseUTXOS')
        let promise = new Promise((resolve, reject) => {
            // const txs = JSON.parse(response.data)
            const convert = (from, to) => str => Buffer.from(str, from).toString(to)
            const utf8ToHex = convert('utf8', 'hex')
            const hexToUtf8 = convert('hex', 'utf8')

            let sent = []
            let minted = []
            let paymentsReceived = []

            let dropMonitor = {} 

            utxos.map((utxo) => {
                if (utxo.amount.length >= 2) {
                    let address = utxo.address
                    let customerAddress = utxo.inputAddress
                    let txInput = utxo.amount[1]
                    let txHash = utxo["txHash"]
                    let txOutput = utxo.amount[utxo.output_index]
                    let txix = `${txHash}#${utxo.output_index}` 
                    let policyID = txInput.unit.substring(0, 56)
                    let tokenNameHex = txInput.unit.substring(56)
                    let tokenName = hexToUtf8(tokenNameHex)
                    let unspentOutput = utxo.unspentOutput
                    let unspent = {output: txOutput.quantity, txix, unspentOutput } 
                    // let unspent = {output: txOutput.quantity, txix} 

                    let mint =  {address, inputAddress: customerAddress, recieved : txInput, unspent, policyID, tokenName, sentStatus: ""}
                    mint["_id"] = txHash

                    if (address != utxo.inputAddress) {
                        mint.sentStatus = true
                        sent.push(mint)
                    } else {
                        mint.sentStatus = false
                        minted.push(mint)
                    }
                    return mint

                } else {

                    let address = utxo.address
                    let txHash = utxo["txHash"]
                    let txInput = utxo.amount[0]
                    let txix = `${txHash}#${utxo.output_index}` 
                    let customerAddress = utxo.inputAddress
                    let payment = txInput.quantity / 1000000
                    let txOutput = utxo.amount[utxo.output_index]
                    // let unspent = {output: txOutput.quantity, txix, } 
                    let unspentOutput = utxo.unspentOutput
                    let unspent = {output: txOutput.quantity, txix, unspentOutput } 

                    if (payment >= 20) {
                        let validPayment = {txHash, customerAddress, payment, recievingAddress: utxo.address, lovelace: txInput.quantity, txix, unspent, unspentOutput}
                        validPayment["_id"] = txHash
                        paymentsReceived.push(validPayment)
                        return validPayment

                    }                 
                } 
            })
            dropMonitor.payments = paymentsReceived 
            dropMonitor.minted =  minted
            dropMonitor.sent =  sent

            resolve(dropMonitor)
            return dropMonitor
        })

        return promise
        }

    getPayments(options) {
            let utxos = options.txs
            // console.log("UTXOS: ", utxos)
            let txhashs = utxos.map(utxo => {
                    options.mintWalletTX = utxo["tx_hash"]
                    return this.getTXData(options).then((results) => {
                        results.txHash = utxo["tx_hash"]
                        return results
                    })
            })

            let mintAddressTransactions = Promise.all(txhashs)            
            .then((txInputs) => {
                let payments = []
                txInputs.forEach((tx) => {
                    if (tx.address !== options.mintWalletAddr) {
                        payments.push(tx) 
                    }
                }) 

                return payments
            })
            .catch(function (error) {
                reject(error.toJSON())
              });

              return mintAddressTransactions
    }

    getWalletUTXOS(options) {

        let promise = new Promise((resolve, reject) => {

            let blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET
            axios.get(`https://cardano-${options.config}.blockfrost.io/api/v0/addresses/${options.mintWalletAddr}/utxos?order=desc`, {headers: {'project_id': `${blockfrostKey}`}})
            .then((response) => {
                // console.log(response.data[0].amount)
                let utxos = response.data
                let formattedUTXOS = utxos.map((utxo) => {
                    utxo.txix = `${utxo.tx_hash}#${utxo.tx_index}`
                    let amount = utxo.amount[0]
                    utxo.unspent = amount.quantity
                    delete utxo.amount
                    delete utxo.block
                    delete utxo.data_hash
                    delete utxo.tx_hash
                    delete utxo.tx_index
                    delete utxo.output_index
                    return utxo
                })
                resolve(formattedUTXOS)
            })
            .catch(e => reject(e.toJSON()))

        })

        return promise
    }


    getTXData(options) {
        let blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET
        
        let promise = new Promise((resolve, reject) => {
            axios.get(`https://cardano-${options.config}.blockfrost.io/api/v0/txs/${options.mintWalletTX}/utxos?order=desc`, {headers: {'project_id': `${blockfrostKey}`}})
            .then((response) => {
                // console.log(options)
                let walletUTXO = response.data 
                let txOutputs = new TXOutputs(walletUTXO.outputs)
                let txInputs = new TXInputs(walletUTXO.inputs)
                let input = txInputs.get()
                let output = txOutputs.getFirst()
                console.log(output)
                console.log(input.address)
                console.log(output.address)
                if ( input.address == options.mintWalletAddr && output.address == input.address) {
                    walletUTXO.sent = true
                } else if (input.address == options.mintWalletAddr && output.address != input.address) {
                    walletUTXO.mint = true
                }
                console.log(walletUTXO)
                // console.log(txOutputs.get())
                // console.log(txInputs.get())
                throw Error()
                // let input = response.data.inputs[0]
                // let output = response.data.outputs[0]
                let unspent = response.data.outputs[1]
                let unspentAmount = unspent["amount"]
                let unspentOutput = unspentAmount[0]
                delete unspentOutput.address
                delete unspentOutput.output_index
                delete unspentOutput.data_hash
                let amount = output.amount[0]
                let customerPayment = {address: input.address , ada: amount.quantity / 1000000, amount: amount.quantity, output: response.data.outputs[0], unspentOutput: unspentOutput.quantity }
                // console.log(customerPayment)
                options.utxos = response.data
                resolve(customerPayment)
            })
            .catch(function (error) {
                reject(console.log(error.response))
                throw Error(error.response)
              });
        })
        return promise
    }

}