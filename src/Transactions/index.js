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
                this.parseUTXOs(options)
                .then((data) => {
                    resolve(data)
                })
            })
            .catch(e => reject(e))

        })
        return promise
    }

    minted(options) {

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

    parseUTXOs(options) {
            let utxos = options.txs
            // console.log("UTXOS: ", utxos)
            let txhashs = utxos.map(utxo => {
                    options.mintWalletTX = utxo["tx_hash"]
                    return this.getTXData(options).then((results) => {
                        return results
                    })
            })

            return Promise.all(txhashs)            
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
            



    }

    getTXData(options) {
        let blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET
        
        let promise = new Promise((resolve, reject) => {
            axios.get(`https://cardano-testnet.blockfrost.io/api/v0/txs/${options.mintWalletTX}/utxos?order=desc`, {headers: {'project_id': `${blockfrostKey}`}})
            .then((response) => {
                // Getting UTXO and parsing input for payment 
                console.log(response.data)
                let input = response.data.inputs[0]
                let output = response.data.outputs[0]
                let amount = output.amount[0]
                let customerPayment = {address: input.address , amount: amount.quantity / 1000000 }
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