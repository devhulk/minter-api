require('dotenv').config()

export default class Transactions {
    constructor() {}

    getWalletUTXOS(options) {
        let promise = new Promise((resolve, reject) => {

            let blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET

            axios.get(`https://cardano-testnet.blockfrost.io/api/v0/addresses/${options.mintWalletAddr}/utxos?order=desc`, {headers: {'project_id': `${blockfrostKey}`}})
            .then((response) => {
                resolve(response.data)
            })
            .catch(e => reject(e))

        })

        return promise
    }

    getTXData(options) {
        let blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET

        let promise = new Promise((resolve, reject) => {
            axios.get(`https://cardano-testnet.blockfrost.io/api/v0/txs/${options.mintWalletTX}/utxos?order=desc`, {headers: {'project_id': `${blockfrostKey}`}})
            .then((response) => {
                console.log(response.data)
                let input = response.data.inputs[0]
                let output = response.data.outputs[0]
                let amount = output.amount[0]
                let amountRecieved = {address: input.address , amount: amount.quantity / 1000000, fullData: response.data }
                res.send(amountRecieved)
            })
            .catch(e => res.send(e))

        })
        return promise
    }

}