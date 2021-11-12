'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var bip39 = require('bip39');

var Cardano = function () {
    function Cardano() {
        _classCallCheck(this, Cardano);
    }

    _createClass(Cardano, [{
        key: 'createWallet',
        value: function createWallet(options) {
            var promise = _axios2.default.post('http://localhost:8090/v2/wallets', {
                name: options.name,
                mnemonic_sentence: options.mnemonic,
                passphrase: options.passphrase
            });

            var dataPromise = promise.then(function (response) {
                return response.data;
            });

            return dataPromise;
        }
    }, {
        key: 'getWalletAddress',
        value: function getWalletAddress(options) {
            var walletID = options.id;

            var promise = _axios2.default.get('http://localhost:8090/v2/wallets/' + walletID + '/addresses?state=unused');

            var dataPromise = promise.then(function (response) {
                return response.data;
            });

            return dataPromise;
        }
    }, {
        key: 'getInfo',
        value: function getInfo() {
            var promise = _axios2.default.get("http://localhost:8090/v2/network/information");

            var dataPromise = promise.then(function (response) {
                return response.data;
            });

            return dataPromise;
        }
    }, {
        key: 'createMnemonic',
        value: function createMnemonic() {
            var mnemonic = bip39.generateMnemonic(256).split(" ");
            console.log(mnemonic);
            return mnemonic;
        }
    }]);

    return Cardano;
}();

exports.default = Cardano;