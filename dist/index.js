'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _Wallet = require('./src/Wallet');

var _Wallet2 = _interopRequireDefault(_Wallet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
app.use((0, _cors2.default)({
    origin: '*'
}));

var wallet = new _Wallet2.default();

//   .then(function (response) {
//     console.log(response);
//   })
app.get('/v1/wallet/getInfo', function (req, res) {
    // TODO: Get all unminted puglies
    wallet.getInfo().then(function (data) {
        res.send(data);
    }).catch(function (err) {
        return console.log(err);
    });
});

app.post('/v1/wallet/', function (req, res) {
    // TODO: Get all unminted puglies
    var mnemonic = wallet.createMnemonic();

    var options = {
        name: "testWallet",
        mnemonic: mnemonic,
        passphrase: "test123"
    };
    wallet.create(options).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        return console.log(err);
    });
});

app.listen(3572, function () {
    console.log('listening on port 3572');
});