"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Wallet = function () {
    function Wallet() {
        _classCallCheck(this, Wallet);
    }

    _createClass(Wallet, [{
        key: "create",
        value: function create() {
            console.log("I'm creating a wallet");
            _axios2.default.post('localhost', {
                Name: 'Fred',
                Age: '23'
            }).then(function (response) {
                console.log(response);
            });
        }
    }, {
        key: "getInfo",
        value: function getInfo(cb) {
            _axios2.default.get("http://localhost:8090/v2/network/information").then(function () {
                cb();
            });
        }
    }]);

    return Wallet;
}();

exports.default = Wallet;