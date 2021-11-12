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
                console.log("txs: ", txs)
                let payments = this.parseUTXOs(txs)
                resolve(payments)
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
            .catch(e => reject(e))

        })

        return promise
    }

    parseUTXOs(walletTXs) {

            let utxos = walletTXs
            console.log("UTXOS: ", utxos)
            let customerNFTPayments = []
            let promises = []
            utxos.map(utxo => {
                    console.log("ParseUTXOs: ", utxo["tx_hash"])
                    promises.push(this.getTXData({mintWalletTX: utxo["tx_hash"], config: options.config}))
                    // .then((customerPayment) => {
                    //         customerNFTPayments.push(customerPayment)
                    //         console.log(customerNFTPayments)
                    //         return customerPayment
                    // })
                    // .catch(e => reject(e))
            })
            Promise.all(promises).then((payments) => {
                console.log(payments)
                return payments
             }).catch((err) => {
                 console.log(err)
             })



    }

    getTXData(options) {
        let blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET

        let promise = new Promise((resolve, reject) => {
            axios.get(`https://cardano-testnet.blockfrost.io/api/v0/txs/${options.mintWalletTX}/utxos?order=desc`, {headers: {'project_id': `${blockfrostKey}`}})
            .then((response) => {
                let input = response.data.inputs[0]
                let output = response.data.outputs[0]
                let amount = output.amount[0]
                // let amount = input.address == body.mintWalletAddr ? output.amount[0] : null
                let customerPayment = {address: input.address , amount: amount.quantity / 1000000 , fullData: response.data}
                resolve(customerPayment)
            })
            .catch(e => reject(e))

        })
        return promise
    }

}