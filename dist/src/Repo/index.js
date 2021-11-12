'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('dotenv').config();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var Repo = function () {
    function Repo() {
        _classCallCheck(this, Repo);
    }

    _createClass(Repo, [{
        key: 'init',
        value: async function init() {}
    }, {
        key: 'createCollection',
        value: async function createCollection(options) {
            var client = new MongoClient(process.env.MONGO_URL);
            client.connect(function (err, client) {
                if (err) throw err;

                var db = client.db('puglies');
                db.collection(options.collection);
                client.close();
            });
        }
    }, {
        key: 'getRandomNFT',
        value: function getRandomNFT() {
            var client = new MongoClient(process.env.MONGO_URL);
            client.connect(function (err, client) {
                if (err) throw err;

                var db = client.db('puglies');
                db.collection('seriesOne').aggregate([{ $sample: { size: 1 } }]).toArray().then(function (doc) {
                    console.log(JSON.stringify(doc));
                    client.close();
                }).catch(function (e) {
                    console.log(e);
                    client.close();
                });
            });
        }
    }]);

    return Repo;
}();

exports.default = Repo;


var repo = new Repo();

repo.createCollection({ collection: 'txsSeriesOne' });