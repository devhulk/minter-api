require('dotenv').config()
const mongodb = require('mongodb')
const { MongoClient } = mongodb

export default class Repo {
    constructor() {}

    async init() {
    }

    async createCollection(options) {
        let promise = new Promise((resolve, reject) => {
            const client = new MongoClient(process.env.MONGO_URL)
            client.connect((err, client) => {
                if (err) throw err; 
        
                const db = client.db('puglies')
                db.collection(options.collection).insertMany(options.txs, (err, result) => {
                    if (err) reject(err);

                    resolve({mongoResult: result, client})
                })
            })

        })

        return promise

    }

    getRandomNFT() {
        const client = new MongoClient(process.env.MONGO_URL)
        client.connect((err, client) => {
            if (err) throw err; 
    
            const db = client.db('puglies')
            db.collection('seriesOne').aggregate([{ $sample: { size: 1 } }]).toArray()
            .then((doc) => {
                console.log(JSON.stringify(doc))
                client.close()
            })
            .catch(e => {
                console.log(e)
                client.close()
            })

        })
    }

    updatePayments() {
        const client = new MongoClient(process.env.MONGO_URL)
        client.connect((err, client) => {
            if (err) throw err; 
    
            const db = client.db('puglies')
            const collection = db.collection('payments')
            // update/upsert/insertMany? payments
        })

    }

    getMintedNFTs(mintData) {
        let promise = new Promise((resolve, reject) => {
            const client = new MongoClient(process.env.MONGO_URL)
            client.connect((err, client) => {
                if (err) reject(err); 
        
                const db = client.db('puglies')
                const collection = db.collection('mintsTest')
                collection.find().toArray()
                .then((result) => {
                    console.log(result)
                    resolve(result)
                    client.close()
                })
                .catch(e => {
                    reject(e)
                    client.close()
                })
            })
        })

        return promise
    }

    insertMintedNFT(mintData) {
        let promise = new Promise((resolve, reject) => {
            const client = new MongoClient(process.env.MONGO_URL)
            client.connect((err, client) => {
                if (err) reject(err); 
        
                const db = client.db('puglies')
                const collection = db.collection('mintsTest')
                collection.insertOne(mintData, (err, result) =>  {
                    if (err) reject(err)

                    resolve({result, client})
                })
            })
        })

        return promise

    }

}
