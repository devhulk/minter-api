require('dotenv').config()
import axios from 'axios'
import Repo from '../Repo'

let repo = new Repo()

export default class Transactions {
    constructor() {}

    payments(options) {
        let promise = new Promise((resolve, reject) => {
            this.getWalletUTXOS(options)
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

    minted(options) {
        let promise = new Promise((resolve, reject) => {
            this.getWalletUTXOS(options)
            .then((txs) => {
                options.txs = txs
                this.getMinted(options)
                .then((txs) => {
                    let mints = []
                    txs.forEach((tx) => {
                        if (tx.address !== options.mintWalletAddr) {
                           mints.push(tx) 
                        }
                    }) 
                    resolve(mints)
                })
            })
            .catch(e => reject(e))

        })
        return promise
    }

    getMinted(options) {
            let utxos = options.txs
            // console.log("UTXOS: ", utxos)
            let txhashs = utxos.map(utxo => {
                    options.mintWalletTX = utxo["tx_hash"]
                    return this.getTXData(options).then((results) => {
                        return results.output
                    })
            })

            let mintAddressTransactions = Promise.all(txhashs)            
            .then((outputs) => {
                return outputs
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

              return mintAddressTransactions
    }

    getWalletUTXOS(options) {
        let promise = new Promise((resolve, reject) => {

            let blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET
            let walletTXs = []
            axios.get(`https://cardano-testnet.blockfrost.io/api/v0/addresses/${options.mintWalletAddr}/utxos?order=desc`, {headers: {'project_id': `${blockfrostKey}`}})
            .then((response) => {
                resolve(response.data)
            })
            .catch(e => reject(e.response.data))

        })

        return promise
    }

    getPayments(options) {
            let utxos = options.txs
            // console.log("UTXOS: ", utxos)
            let txhashs = utxos.map(utxo => {
                    options.mintWalletTX = utxo["tx_hash"]
                    return this.getTXData(options).then((results) => {
                        return results
                    })
            })

            let mintAddressTransactions = Promise.all(txhashs)            
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

              return mintAddressTransactions
    }


    getTXData(options) {
        let blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET
        
        let promise = new Promise((resolve, reject) => {
            axios.get(`https://cardano-testnet.blockfrost.io/api/v0/txs/${options.mintWalletTX}/utxos?order=desc`, {headers: {'project_id': `${blockfrostKey}`}})
            .then((response) => {
                let input = response.data.inputs[0]
                let output = response.data.outputs[0]
                let amount = output.amount[0]
                let customerPayment = {address: input.address , ada: `${amount.quantity / 1000000}`, amount: amount.quantity, output: response.data.outputs[0] }
                options.utxos = response.data
                resolve(customerPayment)
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
        })
        return promise
    }

}