import express from 'express'
import cors from 'cors'
const app = express()
app.use(cors({
    origin: '*'
}))

import Wallet from "./src/Wallet";
let wallet = new Wallet()


        //   .then(function (response) {
        //     console.log(response);
        //   })
app.get('/v1/wallet/getInfo', function (req, res) {
    // TODO: Get all unminted puglies
    wallet.getInfo()
        .then((data) => {
            res.send(data)
        })
        .catch(err => console.log(err))

})

app.post('/v1/wallet/', function (req, res) {
    // TODO: Get all unminted puglies
    let mnemonic = wallet.createMnemonic()

    const options = {
        name: "testWallet",
        mnemonic: mnemonic,
        passphrase: "test123"
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
