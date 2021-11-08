import express from 'express'
import cors from 'cors'
const app = express()
app.use(cors({
    origin: '*'
}))

import Wallet from "./src/Wallet";
let wallet = new Wallet()

app.get('/v1/wallet/getInfo', function (req, res) {
    wallet.getInfo()
        .then((data) => {
            res.send(data)
        })
        .catch(err => console.log(err))
})

app.get('/v1/wallet/:id/getAddress', function (req, res) {
    const options = {
        id: req.params.id
    }
    wallet.getWalletAddress(options)
        .then((data) => {
            res.send(data[0].id)
        })
        .catch(err => console.log(err))

})

app.post('/v1/wallet/', function (req, res) {
    let mnemonic = wallet.createMnemonic()
    const options = {
        name: "", // TODO: process.env("name")
        mnemonic: mnemonic,
        passphrase: "" // TODO: process.env("passphrase")
    }
    wallet.create(options)
        .then(function (response) {
            res.send(response);
        })
        .catch(err => console.log(err))

})


app.listen(3572, ( ) => {
    console.log('listening on port 3572')
})
