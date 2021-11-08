import express from 'express'
import cors from 'cors'
const app = express()
app.use(cors({
    origin: '*'
}))

import Cardano from "./src/Cardano";
import Minter from "./src/Mint"

let client = new Cardano()
let minter = new Minter()

app.get('/v1/cardano/getInfo', function (req, res) {
    client.getInfo()
        .then((data) => {
            res.send(data)
        })
        .catch(err => console.log(err))
})

app.get('/v1/cardano/mint', function (req, res) {
    minter.getProtocolParams()
    .then((data) => {
        res.send(data)
    })
    .catch((e) => console.log(e))
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
