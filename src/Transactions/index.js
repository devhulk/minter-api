require('dotenv').config()
import axios from 'axios'
import Repo from '../Repo'

let repo = new Repo()

export default class Transactions {
    constructor() {}

    getWalletUTXOS(options) {
        let promise = new Promise((resolve, reject) => {

            let blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET
            let customerNFTPayments = []
            let otherPayments = []
            let walletTXs = []
            let promises = []
promises.push(
            axios.get(`https://cardano-testnet.blockfrost.io/api/v0/addresses/${options.mintWalletAddr}/utxos?order=desc`, {headers: {'project_id': `${blockfrostKey}`}})
            .then((response) => {
                // need to get all TXs for wallet and insert them into txsSeriesOne collection
                // then I need to get the address of the customer and the quantity paid and insert that into a series-1-customer collection
                // then I can mint a pugly (get random pugly series-1-puglies) (minted: false)
                // then I can send that minted pugly to the customer address
                walletTXs = response.data
                let utxos = walletTXs
                utxos.forEach(utxo => {
                    promises.push(
                        this.getTXData({mintWalletTX: utxo["tx_hash"], config: options.config})
                        .then((customerPayment) => {
                                console.log(customerPayment)
                                customerNFTPayments.push(customerPayment)
                        })
                        .catch(e => reject(e))
                    )
                })

                // repo.createCollection({collection: txsSeriesOne, txs: response.data})
                // .then((mongo) => {
                //     mongo.client.close()
                //     resolve(mongo.mongoResult)
                // })
                // .catch(e => reject(e))
            })
            .catch(e => reject(e))
            )

            Promise.all(promises).then((values) => {
                resolve(values)
            })
            .catch(err => reject(err))

        })

        return promise
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