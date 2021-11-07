import express from 'express'
import cors from 'cors'
const app = express()
app.use(cors({
    origin: '*'
}))

import Wallet from "./src/Wallet";


app.get('/v1/wallet/getInfo', function (req, res) {
    // TODO: Get all unminted puglies
    let wallet = new Wallet()

    wallet.getInfo()
        .then((value) => {
            res.send(value)
        })
})


app.listen(3572, ( ) => {
    console.log('listening on port 3572')
})
