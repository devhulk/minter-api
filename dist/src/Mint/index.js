'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dns = require('dns');

var _process = require('process');

var _Metadata = require('../Metadata');

var _Metadata2 = _interopRequireDefault(_Metadata);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('child_process'),
    spawn = _require.spawn,
    exec = _require.exec;

var fs = require('fs');

var Minter = function () {
    function Minter() {
        _classCallCheck(this, Minter);
    }

    _createClass(Minter, [{
        key: 'getProtocolParams',
        value: function getProtocolParams() {
            // 3. Get protocol params
            var promise = new Promise(function (resolve, reject) {

                var config = 'testnet';
                var network = config == 'testnet' ? '--testnet-magic' : '--mainnet';
                var magic = network == '--testnet-magic' ? '1097911063' : '';
                var params = spawn('cardano-cli', ['query', 'protocol-parameters', network, magic]);

                params.stdout.on('data', function (data) {
                    console.log("ProtocolData: ", data);
                    fs.writeFile('protocol.json', data, function (err) {
                        if (err) {
                            reject(err);
                        }
                    });
                    resolve(JSON.parse(data));
                });

                params.stderr.on('data', function (data) {
                    console.error("Error: ", data);
                    reject(data);
                });
            });
            return promise;
        }
    }, {
        key: 'getMintWalletHash',
        value: function getMintWalletHash(options) {
            var promise = new Promise(function (resolve, reject) {

                var config = options.config;
                var network = config == 'testnet' ? '--testnet-magic' : '--mainnet';
                var magic = network == '--testnet-magic' ? '1097911063' : '';
                exec('cardano-cli query utxo --address $(cat mintWallet/payment.addr) ' + network + ' ' + magic + ' --out-file=txixhash.json', function (err, stdout, stderr) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    var file = fs.readFileSync('txixhash.json');
                    var data = JSON.parse(file);
                    var balanceObj = data['' + Object.keys(data)[0]];
                    var lovelace = balanceObj.value.lovelace;
                    var ada = balanceObj.value.lovelace / 1000000;
                    var returnObj = { txixhash: Object.keys(data)[0], balance: { lovelace: lovelace, ada: ada }, address: options.address };

                    resolve(returnObj);
                    return;
                });
            });
            return promise;
        }
    }, {
        key: 'getCustomerWalletHash',
        value: function getCustomerWalletHash(options) {
            var promise = new Promise(function (resolve, reject) {

                var config = options.config;
                var network = config == 'testnet' ? '--testnet-magic' : '--mainnet';
                var magic = network == '--testnet-magic' ? '1097911063' : '';
                exec('cardano-cli query utxo --address ' + options.customerAddress + ' ' + network + ' ' + magic + ' --out-file=txixhash.json', function (err, stdout, stderr) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    var file = fs.readFileSync('txixhash.json');
                    var data = JSON.parse(file);
                    var balanceObj = data['' + Object.keys(data)[0]];
                    var lovelace = balanceObj.value.lovelace;
                    var ada = balanceObj.value.lovelace / 1000000;

                    var returnObj = { txixhash: Object.keys(data)[0], balance: { lovelace: lovelace, ada: ada }, address: options.address };

                    resolve(returnObj);
                    return;
                });
            });
            return promise;
        }
    }, {
        key: 'getPolicyID',
        value: function getPolicyID() {
            var promise = new Promise(function (resolve, reject) {
                var policyObj = {};
                fs.readFile('policy/policyID', 'utf8', function (err, data) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    policyObj.id = data;
                    fs.readFile('policy/policy.script', 'utf8', function (err, data) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        var file = JSON.parse(data);
                        policyObj.slotnumber = file.scripts[0].slot;

                        resolve(policyObj);
                    });
                });
            });
            return promise;
        }
    }, {
        key: 'getMetaData',
        value: function getMetaData(data) {
            // 6. Retrieve token Metadata
            var promise = new Promise(function (resolve, reject) {
                var id = data.policy.id.trim();
                var dataHandler = new _Metadata2.default({ policy_id: id, asset_id: data.request.metadata.asset_id, asset_name: data.request.metadata.asset_name, ipfsLink: data.request.metadata.ipfsLink, traits: data.request.metadata.traits, amount: data.request.metadata.amount });
                var metadata = dataHandler.format();
                fs.writeFile('metadata.json', metadata, function (err) {
                    if (err) {
                        reject(err);
                    }

                    resolve(JSON.parse(metadata));
                });
            });

            return promise;
        }
    }, {
        key: 'calculateFee',
        value: function calculateFee(options) {
            var promise = new Promise(function (resolve, reject) {
                var config = options.request.config;
                var network = config == 'testnet' ? '--testnet-magic' : '--mainnet';
                var magic = network == '--testnet-magic' ? '1097911063' : '';
                var cmd = 'cardano-cli transaction calculate-min-fee --tx-body-file ./transactions/raw/' + options.request.metadata.asset_id + '.raw --tx-in-count 1 --tx-out-count 1 --witness-count 2 --protocol-params-file=protocol.json ' + network + ' ' + magic + ' | cut -d " " -f1';
                exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(stdout);
                    return;
                });
            });

            return promise;
        }
    }, {
        key: 'buildRawTransaction',
        value: function buildRawTransaction(options) {
            var output = options.output == undefined ? "0" : options.mintWalletInfo.balance.lovelace - options.fee;
            var fee = options.fee == undefined ? "0" : options.fee;
            var promise = new Promise(function (resolve, reject) {
                //  --out-file /transactions/raw/${option.metadata.asset_id}.raw
                //address="${options.mintWalletInfo.address}"
                var cmd = '\n#!/bin/bash\n\nfee="' + fee + '"\ntxix="' + options.mintWalletInfo.txixhash + '"\naddress="' + options.mintWalletInfo.address + '"\noutput="' + output + '"\ntokenamount="' + options.request.metadata.amount + '"\npolicyid="' + options.policy.id.trim() + '"\ntokenname="' + options.request.metadata.asset_id + '"\nslotnumber="' + options.policy.slotnumber + '"\n\ncardano-cli transaction build-raw --fee $fee --tx-in $txix --tx-out $address+$output+"$tokenamount $policyid.$tokenname" --mint="$tokenamount $policyid.$tokenname" --minting-script-file policy/policy.script --minting-script-file policy/policy.script --invalid-hereafter $slotnumber --out-file ./transactions/raw/$tokenname.raw';
                console.log(cmd);
                exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        // console.log(err)
                        reject(err);
                        return;
                    }
                    resolve(stdout);
                });
            });
            return promise;
        }
    }, {
        key: 'finalizeTransaction',
        value: function finalizeTransaction(options) {
            var _this = this;

            var promise = new Promise(function (resolve, reject) {
                var config = options.config;
                var network = config == 'testnet' ? '--testnet-magic' : '--mainnet';
                var magic = network == '--testnet-magic' ? '1097911063' : '';
                var cmd = 'cardano-cli transaction sign --signing-key-file mintWallet/payment.skey --signing-key-file policy/policy.skey ' + network + ' ' + magic + ' --tx-body-file ./transactions/raw/' + options.request.metadata.asset_id + '.raw --out-file ./transactions/signed/' + options.request.metadata.asset_id + '.signed';
                console.log(cmd);
                exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        console.log(err);
                        reject(err);
                        return;
                    }
                    console.log(options);
                    _this.submitTransaction(options).then(function (data) {
                        resolve(stdout);
                    }).catch(function (e) {
                        return reject(e);
                    });
                    return;
                });
            });
            return promise;
        }
    }, {
        key: 'submitTransaction',
        value: function submitTransaction(options) {
            var promise = new Promise(function (resolve, reject) {
                var config = options.request.config;
                var network = config == 'testnet' ? '--testnet-magic' : '--mainnet';
                var magic = network == '--testnet-magic' ? '1097911063' : '';
                var cmd = 'cardano-cli transaction submit --tx-file ./transactions/signed/' + options.request.metadata.asset_id + '.signed ' + network + ' ' + magic;
                console.log(cmd);
                exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        console.log(err);
                        reject(err);
                        return;
                    }
                    resolve(stdout);
                    return;
                });
            });
            return promise;
        }
    }, {
        key: 'sendToken',
        value: function sendToken() {}

        // Steps to Mint
        // 1. Create Wallet with Payment Address
        // 2. Fund Wallet
        // 3. Get protocol params
        // 4. Create Policy Keys and Policy Script
        // 5. Generate PolicyID
        // 6. Retrieve token Metadata
        // 7. Build Raw TX -> Calculate Fee -> Sign TX -> Submit TX

    }]);

    return Minter;
}();

exports.default = Minter;