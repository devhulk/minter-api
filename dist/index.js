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

app.get('/v1/wallet/getInfo', function (req, res) {
    // TODO: Get all unminted puglies
    var wallet = new _Wallet2.default();

    wallet.getInfo(function (info) {
        res.send(info);
    });
});

app.listen(3572, function () {
    console.log('listening on port 3572');
});