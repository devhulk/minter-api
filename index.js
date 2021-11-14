import express from 'express'
import cors from 'cors'
const bodyParser = require('body-parser')
const app = express()
app.use(cors({
    origin: '*'
}))

app.use(bodyParser.json())

// import Cardano from "./src/Cardano";
import Minter from "./src/Mint"
import Transactions from './src/Transactions'
import axios from 'axios'

app.post('/v1/cardano/address/payments', function (req, res) {
    let body = req.body
    let walletTransactions = new Transactions()

    walletTransactions.payments(body)
    .then((payments) => {
        res.send(payments)
    })
    .catch(e => res.send(e))



})

app.post('/v1/cardano/address/mints', function (req, res) {
    let body = req.body
    let walletTransactions = new Transactions()

    walletTransactions.minted(body)
    .then((mints) => {
        res.send(mints)
    })
    .catch(e => res.send(e))

})

app.post('/v1/cardano/mint/asset', function (req, res) {
    let minter = new Minter()
    console.log(req.body)
    minter.mint(req)
    .then((mintData) => {
        res.send(mintData)
    })
})

app.post('/v1/cardano/mint/sendAsset', function (req, res) {
    let minter = new Minter()
    minter.send(req.body)
    .then((mintData) => {
        res.send(mintData)
    })
    .catch((e) => res.send(e))
})

app.get('/v1/cardano/mint/assets', function (req, res) {
    let minter = new Minter()
})

app.post('/v1/cardano/txs/utxos', function (req, res) {
    let body = req.body
    let mintWalletTX = body.mintWalletTX
    axios.get(`https://cardano-testnet.blockfrost.io/api/v0/txs/${mintWalletTX}/utxos?order=desc`, {headers: {'project_id': 'testnetxR0g77qOcoQ9CZbE5TOrYstSzERzVFef'}})
    .then((response) => {
        let input = response.data.inputs[0]
        let output = response.data.outputs[0]
        let amount = input.amount[0] 
        let amountRecieved = {address: input.address , amount: amount.quantity / 1000000}
        console.log(amountRecieved)
        res.send(response.data)
    })
    .catch(e => res.send(e))

})



app.get('/v1/cardano/wallet/:id/getAddress', function (req, res) {
    const options = {
        id: req.params.id
    }
    client.getWalletAddress(options)
        .then((data) => {
            res.send(data[0].id)
        })
        .catch(err => console.log(err))

})

app.post('/v1/cardano/wallet/', function (req, res) {
    let mnemonic = client.createMnemonic()
    let responseData = {}
    const options = {
        name: "testWallet2", // TODO: process.env("name")
        mnemonic: mnemonic,
        passphrase: "thisisatest" // TODO: process.env("passphrase")
    }
    client.createWallet(options)
        .then(function (response) {
            // res.send(response);
            responseData.wallet = response
        })
        .then(() => {
            responseData.wallet.id
            client.getWalletAddress(responseData.wallet)
                .then((data) => {
                    responseData.address = data[0].id
                    res.send(responseData)
                })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
})


app.listen(3572, ( ) => {
    console.log('listening on port 3572')
})
