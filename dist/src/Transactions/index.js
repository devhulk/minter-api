'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('dotenv').config();

var Transactions = function () {
    function Transactions() {
        _classCallCheck(this, Transactions);
    }

    _createClass(Transactions, [{
        key: 'getWalletUTXOS',
        value: function getWalletUTXOS(options) {
            var promise = new Promise(function (resolve, reject) {

                var blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET;

                _axios2.default.get('https://cardano-testnet.blockfrost.io/api/v0/addresses/' + options.mintWalletAddr + '/utxos?order=desc', { headers: { 'project_id': '' + blockfrostKey } }).then(function (response) {
                    // need to get all TXs for wallet and insert them into txsSeriesOne collection
                    // then I need to get the address of the customer and the quantity paid and insert that into a series-1-customer collection
                    // then I can mint a pugly (get random pugly series-1-puglies) (minted: false)
                    // then I can send that minted pugly to the customer address
                    resolve(response.data);
                }).catch(function (e) {
                    return reject(e);
                });
            });

            return promise;
        }
    }, {
        key: 'getTXData',
        value: function getTXData(options) {
            var blockfrostKey = options.config == "testnet" ? process.env.BLOCKFROST_TESTNET : process.env.BLOCKFROST_MAINNET;

            var promise = new Promise(function (resolve, reject) {
                _axios2.default.get('https://cardano-testnet.blockfrost.io/api/v0/txs/' + options.mintWalletTX + '/utxos?order=desc', { headers: { 'project_id': '' + blockfrostKey } }).then(function (response) {
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
            return promise;
        }
    }]);

    return Transactions;
}();

exports.default = Transactions;