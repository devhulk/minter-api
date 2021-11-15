require('dotenv').config()
const mongodb = require('mongodb')
const { MongoClient } = mongodb

export default class Repo {
    constructor() {}

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


    getMintedNFTs() {
        let promise = new Promise((resolve, reject) => {
            const client = new MongoClient(process.env.MONGO_URL)
            client.connect((err, client) => {
                if (err) reject(err); 
        
                const db = client.db('puglies')
                const collection = db.collection('testMints')
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

    getPayments() {
        let promise = new Promise((resolve, reject) => {
            const client = new MongoClient(process.env.MONGO_URL)
            client.connect((err, client) => {
                if (err) reject(err); 
        
                const db = client.db('puglies')
                const collection = db.collection('testPayments')
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

    getSent() {
        let promise = new Promise((resolve, reject) => {
            const client = new MongoClient(process.env.MONGO_URL)
            client.connect((err, client) => {
                if (err) reject(err); 
        
                const db = client.db('puglies')
                const collection = db.collection('testSentOrders')
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

    updateMintedNFTS(mintData) {
        // mintData["_id"] = mintData.txHash
        let promise = new Promise((resolve, reject) => {
            const client = new MongoClient(process.env.MONGO_URL)
            client.connect((err, client) => {
                if (err) reject(err); 
        
                const db = client.db('puglies')
                const collection = db.collection('testMints')
                collection.insertMany(mintData, { ordered: false }, (err, result) =>  {
                    if (err) reject(err)

                    client.close()
                    resolve(result)
                })
            })
        })

        return promise

    }

    updatePayments(payments) {
        let promise = new Promise((resolve, reject) => {
            const client = new MongoClient(process.env.MONGO_URL)
            client.connect((err, client) => {
                if (err) reject(err); 
        
                const db = client.db('puglies')
                const collection = db.collection('testPayments')
                collection.insertMany(payments, { ordered: false }, (err, result) =>  {
                    if (err) reject(err)

                    client.close()
                    resolve(result)
                })
            })
        })

        return promise

    }
    updateSent(payments) {
        let promise = new Promise((resolve, reject) => {
            const client = new MongoClient(process.env.MONGO_URL)
            client.connect((err, client) => {
                if (err) reject(err); 
        
                const db = client.db('puglies')
                const collection = db.collection('testSentOrders')
                collection.insertMany(payments, { ordered: false }, (err, result) =>  {
                    if (err) reject(err)

                    client.close()
                    resolve(result)
                })
            })
        })

        return promise

    }

}
