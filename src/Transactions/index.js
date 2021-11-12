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
                // console.log("txs: ", txs)
                options.txs = txs
                let payments = this.parseUTXOs(options)
                console.log(payments)
                resolve(payments)
                // resolve(payments)
            })
            .catch(e => reject(e))

        })
        return promise
    }

    getWalletUTXOS(options) {
        let promise = new Promise((resolve, reject) => {

            let blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET
            let walletTXs = []
            axios.get(`https://cardano-testnet.blockfrost.io/api/v0/addresses/${options.mintWalletAddr}/utxos?order=desc`, {headers: {'project_id': `${blockfrostKey}`}})
            .then((response) => {
                // need to get all TXs for wallet and insert them into txsSeriesOne collection
                // then I need to get the address of the customer and the quantity paid and insert that into a series-1-customer collection
                // then I can mint a pugly (get random pugly series-1-puglies) (minted: false)
                // then I can send that minted pugly to the customer address
                resolve(response.data)

                // let utxos = walletTXs
                // let customerNFTPayments = []
                // utxos.forEach(utxo => {
                //     promises.push(
                //         this.getTXData({mintWalletTX: utxo["tx_hash"], config: options.config})
                //         .then((customerPayment) => {
                //                 customerNFTPayments.push(customerPayment)
                //                 console.log(customerNFTPayments)
                //                 // resolve(customerPayment)
                //         })
                //         .catch(e => reject(e))
                //     )
                // })

                // repo.createCollection({collection: txsSeriesOne, txs: response.data})
                // .then((mongo) => {
                //     mongo.client.close()
                //     resolve(mongo.mongoResult)
                // })
                // .catch(e => reject(e))
            })
            .catch(e => reject(e.response.data))

        })

        return promise
    }

    parseUTXOs(options) {
        console.log("PARSE UTXOS: ", options)

            let utxos = options.txs
            // console.log("UTXOS: ", utxos)
            let txhashs = utxos.map(utxo => {
                    options.mintWalletTX = utxo["tx_hash"]
                    return this.getTXData(options).then((results) => {
                        return results
                    })
                    // promises.push(this.getTXData({mintWalletTX: utxo["tx_hash"], config: options.config}))
                    // .then((customerPayment) => {
                    //         customerNFTPayments.push(customerPayment)
                    //         console.log(customerNFTPayments)
                    //         return customerPayment
                    // })
                    // .catch(e => reject(e))
            })

            Promise.all(txhashs).then((results) => {
                console.log("Im in the PROMISE ALL: " ,results)
                return results
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
            



    }

    getTXData(options) {
        let blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET
        // console.log(options.mintWalletTX)

        let promise = new Promise((resolve, reject) => {
            axios.get(`https://cardano-testnet.blockfrost.io/api/v0/txs/${options.mintWalletTX}/utxos?order=desc`, {headers: {'project_id': `${blockfrostKey}`}})
            .then((response) => {
                let input = response.data.inputs[0]
                let output = response.data.outputs[0]
                let amount = output.amount[0]
                // let amount = input.address == body.mintWalletAddr ? output.amount[0] : null
                let customerPayment = {address: input.address , amount: amount.quantity / 1000000 }
                // console.log(customerPayment)
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