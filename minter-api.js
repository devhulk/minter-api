import express from 'express'
import cors from 'cors'
let winston = require('winston'),
    expressWinston = require('express-winston');
const bodyParser = require('body-parser')
const app = express()
app.use(cors({
    origin: '*'
}))
app.use(bodyParser.json())
// app.use(expressWinston.logger({
//     transports: [
//       new winston.transports.Console()
//     ],
//     format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.json()
//     ),
//     meta: true, // optional: control whether you want to log the meta data about the request (default to true)
//     msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
//     expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
//     colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
//     // ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
//   }));

// //   express-winston errorLogger makes sense AFTER the router.
//   app.use(expressWinston.errorLogger({
//     transports: [
//       new winston.transports.Console()
//     ],
//     format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.json()
//     )
//   }));


import Minter from "./src/Mint"
import Transactions from './src/Transactions'
import axios from 'axios'
import Repo from './src/Repo'

app.post('/v1/cardano/address/payments', function (req, res) {
    let body = req.body
    let walletTransactions = new Transactions()

    walletTransactions.payments(body)
    .then((payments) => {
        res.send(payments)
    })
    .catch(e => res.send(e))



})

app.post('/v1/cardano/address/utxos', function (req, res) {
    let body = req.body
    let walletTransactions = new Transactions()

    // walletTransactions.utxos(body)
    // .then((utxos) => {
    //     res.json(JSON.stringify(utxos))
    // })
    walletTransactions.getWalletUTXOS((utxos) => {
        res.json(JSON.stringify(utxos))
    })
    .catch(e => res.send(e))

})

app.get('/v1/cardano/random/nft', function (req, res) {
    let repo = new Repo()
    repo.getRandomNFT()
    .then((response) => {
        res.send(response)
    })
    .catch((err) => {
        res.send(err)
    })
})

app.get('/v1/cardano/minted', function (req, res) {
    let repo = new Repo()
    repo.getMintedNFTs()
    .then((response) => {
        res.send(response)
    })
    .catch((err) => {
        res.send(err)
    })
})

app.post('/v1/cardano/minted', function (req, res) {
    let repo = new Repo()
    let mints = req.body
    repo.updateMintedNFTS(mints)
    .then((results) => {
        res.send(results)
    })
    .catch((err) => {
        res.send(err)
    })
})

app.post('/v1/cardano/payments', function (req, res) {
    let repo = new Repo()
    repo.updatePayments(req.body)
    .then((results) => {
        res.send(results)
    })
    .catch((err) => {
        res.send(err)
    })
})

app.post('/v1/cardano/orders/sent', function (req, res) {
    let repo = new Repo()
    repo.updateSent(req.body)
    .then((results) => {
        res.send(results)
    })
    .catch((err) => {
        res.send(err)
    })
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
    minter.deliver(req)
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
