'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _Mint = require('./src/Mint');

var _Mint2 = _interopRequireDefault(_Mint);

var _Transactions = require('./src/Transactions');

var _Transactions2 = _interopRequireDefault(_Transactions);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bodyParser = require('body-parser');
var app = (0, _express2.default)();
app.use((0, _cors2.default)({
    origin: '*'
}));

app.use(bodyParser.json());

// import Cardano from "./src/Cardano";


// let client = new Cardano()
// I need to be able to look at an address and see the recent txs, how much was sent to the addr, and who sent it. Also need to monitor this on a time increment. 
app.post('/v1/cardano/address/utxos', function (req, res) {
    var body = req.body;
    var walletTransactions = new _Transactions2.default();

    walletTransactions.getWalletUTXOS(body).then(function (txs) {
        res.send(txs);
    });
});

app.post('/v1/cardano/txs/utxos', function (req, res) {
    var body = req.body;
    var mintWalletTX = body.mintWalletTX;
    _axios2.default.get('https://cardano-testnet.blockfrost.io/api/v0/txs/' + mintWalletTX + '/utxos?order=desc', { headers: { 'project_id': 'testnetxR0g77qOcoQ9CZbE5TOrYstSzERzVFef' } }).then(function (response) {
        console.log(response.data);
        var input = response.data.inputs[0];
        var output = response.data.outputs[0];
        var amount = output.amount[0];
        var amountRecieved = { address: input.address, amount: amount.quantity / 1000000, fullData: response.data };
        res.send(amountRecieved);
    }).catch(function (e) {
        return res.send(e);
    });
});

app.get('/v1/cardano/mint/assets', function (req, res) {
    var minter = new _Mint2.default();
});

app.post('/v1/cardano/mint/asset', function (req, res) {
    var minter = new _Mint2.default();
    var body = req.body;
    var mintData = { request: req.body };
    minter.getProtocolParams().then(function (data) {
        mintData.protocolParams = data;
    }).then(function () {
        minter.getMintWalletHash(body).then(function (data) {
            mintData.mintWalletInfo = data;
        }).then(function () {
            minter.getPolicyID().then(function (policy) {
                mintData.policy = policy;
            }).then(function () {
                minter.getMetaData(mintData).then(function (metadata) {
                    mintData.metadata = metadata;
                }).then(function () {
                    minter.buildRawTransaction(mintData).then(function (data) {
                        mintData.output = 0;
                    }).then(function () {
                        minter.calculateFee(mintData).then(function (data) {
                            mintData.fee = data.trim();
                            minter.buildRawTransaction(mintData).then(function (data) {
                                mintData.output = mintData.mintWalletInfo.balance.lovelace - mintData.fee;
                                minter.finalizeTransaction(mintData).then(function (data) {
                                    res.send(mintData);
                                    // send token to other wallet
                                }).catch(function (e) {
                                    return res.send('Error: ' + e);
                                });
                            }).catch(function (e) {
                                return res.send('Error: ' + e);
                            });
                        }).catch(function (e) {
                            return res.send('Error: ' + e);
                        });
                    }).catch(function (e) {
                        return res.send('Error: ' + e);
                    });
                });
            }).catch(function (e) {
                return res.send('Error: ' + e);
            }).catch(function (e) {
                return res.send('Error: ' + e);
            });
        });
    }).catch(function (e) {
        return console.log(e);
    });
});

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


app.listen(3572, function () {
    console.log('listening on port 3572');
});