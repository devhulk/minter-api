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
import axios from 'axios'

// let client = new Cardano()

app.post('/v1/cardano/transactions', function (req, res) {
    axios.get(`https://cardano-testnet.blockfrost.io/api/v0/addresses/addr_test1vpfvdy0rvkawm6zz4l3y5fykyagp5r7g300xv7dhrkxs4aq8mt5vq/transactions`, {headers: {'project_id': 'testnetxR0g77qOcoQ9CZbE5TOrYstSzERzVFef'}})
    .then((response) => {
        res.send(response)
    })

})

app.get('/v1/cardano/mint/assets', function (req, res) {
    let minter = new Minter()
})

app.post('/v1/cardano/mint/asset', function (req, res) {
    let minter = new Minter()
    let body = req.body
    let mintData = {request: req.body}
    minter.getProtocolParams()
    .then((data) => {
        mintData.protocolParams = data
    })
    .then(() => {
        minter.getMintWalletHash(body)
        .then((data) => {
            mintData.mintWalletInfo = data
        })
        .then(() => {
            minter.getPolicyID()
            .then((policy) => {
                mintData.policy = policy
            })
            .then(() => {
                minter.getMetaData(mintData)
                .then((metadata) => {
                    mintData.metadata = metadata
                })
                .then(() => {
                    minter.buildRawTransaction(mintData)
                    .then((data) => {
                        mintData.output = 0
                    })
                    .then(() => {
                        minter.calculateFee(mintData)
                        .then((data) => {
                            mintData.fee = data.trim()
                            minter.buildRawTransaction(mintData)
                            .then((data) => {
                                mintData.output = mintData.mintWalletInfo.balance.lovelace - mintData.fee
                                minter.finalizeTransaction(mintData)
                                .then((data) => {
                                    res.send(mintData)
                                    // send token to other wallet
                                })
                                .catch((e) => res.send(`Error: ${e}`))
                            })
                            .catch((e) => res.send(`Error: ${e}`))
                        })
                        .catch((e) => res.send(`Error: ${e}`))
                    })
                    .catch((e) => res.send(`Error: ${e}`) )
                })
            })
            .catch((e) => res.send(`Error: ${e}`))
        .catch((e) => res.send(`Error: ${e}`))
        })
    })
    .catch((e) => console.log(e))
})



// app.get('/v1/cardano/wallet/:id/getAddress', function (req, res) {
//     const options = {
//         id: req.params.id
//     }
//     client.getWalletAddress(options)
//         .then((data) => {
//             res.send(data[0].id)
//         })
//         .catch(err => console.log(err))

// })

// app.post('/v1/cardano/wallet/', function (req, res) {
//     let mnemonic = client.createMnemonic()
//     let responseData = {}
//     const options = {
//         name: "testWallet2", // TODO: process.env("name")
//         mnemonic: mnemonic,
//         passphrase: "thisisatest" // TODO: process.env("passphrase")
//     }
//     client.createWallet(options)
//         .then(function (response) {
//             // res.send(response);
//             responseData.wallet = response
//         })
//         .then(() => {
//             responseData.wallet.id
//             client.getWalletAddress(responseData.wallet)
//                 .then((data) => {
//                     responseData.address = data[0].id
//                     res.send(responseData)
//                 })
//             .catch(err => console.log(err))
//         })
//         .catch(err => console.log(err))
// })


app.listen(3572, ( ) => {
    console.log('listening on port 3572')
})
