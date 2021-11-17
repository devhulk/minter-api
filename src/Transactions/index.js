require('dotenv').config()
import axios from 'axios'
import json from 'body-parser/lib/types/json'
import Repo from '../Repo'

let repo = new Repo()

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
        let promise = new Promise((resolve, reject) => {
            this.getWalletTXS(options)
            .then((txs) => {
                options.txs = txs
                this.getAllUTXOS(options)
                .then((utxos) => {
                    this.parseUTXOS(utxos)
                    .then((utxos) => {
                        resolve(utxos)
                    })
                })
            })
            .catch(e => reject(e))

        })
        return promise
    }

    getAllUTXOS(options) {
            let utxos = options.txs
            // console.log("UTXOS: ", utxos)
            let txhashs = utxos.map(utxo => {
                    options.mintWalletTX = utxo["tx_hash"]
                    return this.getTXData(options).then((results) => {
                        results.output.txHash = utxo["tx_hash"]
                        results.output.inputAddress = results.address
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
                return JSON.stringify(utxos)
            })
            .catch(function (error) {
                if (error.response) {
                  // Request made and server responded
                  console.log(error.response.data);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                } else if (error.request) {
                  // The request was made but no response was received
                  console.log(error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log('Error', error.message);
                }
            
              });

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
            let validUTXOs = []

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
                    let unspent = {output: txOutput.quantity, txix} 

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
                    let unspent = {output: txOutput.quantity, txix} 

                    if (payment >= 20) {
                        let validPayment = {txHash, customerAddress, payment, recievingAddress: utxo.address, lovelace: txInput.quantity, txix, unspent}
                        validPayment["_id"] = txHash
                        paymentsReceived.push(validPayment)
                        return validPayment

                    } else {
                        let invalidPayment = {txHash, address, customerAddress, status: "Payment below 20ADA", unspent}
                        invalidPayment["_id"] = txHash
                        validUTXOs.push(invalidPayment) 
                        return invalidPayment 
                    }
                } 
            })
            dropMonitor.payments = paymentsReceived 
            dropMonitor.minted =  minted
            dropMonitor.sent =  sent
            dropMonitor.validUTXOs = sent

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


    getTXData(options) {
        let blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET
        
        let promise = new Promise((resolve, reject) => {
            axios.get(`https://cardano-${options.config}.blockfrost.io/api/v0/txs/${options.mintWalletTX}/utxos?order=desc`, {headers: {'project_id': `${blockfrostKey}`}})
            .then((response) => {
                let input = response.data.inputs[0]
                let output = response.data.outputs[0]
                let amount = output.amount[0]
                let customerPayment = {address: input.address , ada: amount.quantity / 1000000, amount: amount.quantity, output: response.data.outputs[0] }
                // console.log(customerPayment)
                options.utxos = response.data
                resolve(customerPayment)
            })
            .catch(function (error) {
                reject(error.toJSON())
              });
        })
        return promise
    }

}