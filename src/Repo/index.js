require('dotenv').config()
const mongodb = require('mongodb')
const { MongoClient } = mongodb

export default class Repo {
    constructor() {}

    getRandomNFT(request) {
        const client = new MongoClient(process.env.MONGO_URL)
        client.connect((err, client) => {
            if (err) throw err; 
    
            const db = client.db('puglies')
            db.collection(process.env.SERIES).aggregate([{ $sample: { size: 1 } }]).toArray()
            .then((nft) => {
                nft.claim = request
                this.insertClaimed(nft)
                .then((result) => {
                    client.close()
                    return result
                })
                .catch(e => {
                    console.log(e)
                    client.close()
                })
            })
            .catch(e => {
                console.log(e)
                client.close()
            })

        })
    }

    updateNFT(request, coll) {
        let promise = new Promise((resolve, reject) => {
            const client = new MongoClient(process.env.MONGO_URL)
            client.connect((err, client) => {
                if (err) reject(err); 
        
                const db = client.db('puglies')
                const collection = db.collection(coll)
                collection.updateOne(request, { name: request.name }, (err, result) =>  {
                    if (err) reject(err)

                    client.close()
                    resolve(result)
                })
            })
        })

        return promise

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
            if (mintData.length == 0) {
                console.log({status: "No mints in wallet"})
            } else {
                const client = new MongoClient(process.env.MONGO_URL)
                client.connect((err, client) => {
                    if (err) reject(err); 
            
                    const db = client.db('puglies')
                    const collection = db.collection(process.env.MINTED_COLLECTION)
                    collection.insertMany(mintData, { ordered: false }, (err, result) =>  {
                        if (err) reject(err)

                        client.close()
                        resolve(result)
                    })
                })

            }
        })

        return promise

    }

    updatePayments(payments) {
        console.log("In update payments NFT function")
        let promise = new Promise((resolve, reject) => {
            if (payments.length == 0) {
                resolve({status: "No payments in wallet"})
            } else {
                const client = new MongoClient(process.env.MONGO_URL)
                client.connect((err, client) => {
                    if (err) reject(err); 
            
                    const db = client.db('puglies')
                    const collection = db.collection(process.env.PAYMENTS_COLLECTION)
                    collection.insertMany(payments, { ordered: false }, (err, result) =>  {
                        if (err) reject(err)

                        client.close()
                        resolve(result)
                    })
                })

            }
        })

        return promise

    }
    updateSent(sent) {
        console.log("In update sent NFT function")
        let promise = new Promise((resolve, reject) => {
            if (sent.length == 0) {
                resolve({status: "No payments in wallet"})
            } else {
                const client = new MongoClient(process.env.MONGO_URL)
                client.connect((err, client) => {
                    if (err) reject(err); 
            
                    const db = client.db('puglies')
                    const collection = db.collection(process.env.SENT_COLLECTION)
                    collection.insertMany(sent, { ordered: false }, (err, result) =>  {
                        if (err) reject(err)

                        client.close()
                        resolve(result)
                    })
                })

            }
        })

        return promise

    }

    insertClaimed(nft) {
        nft["_id"] = nft.name
        let promise = new Promise((resolve, reject) => {
            const client = new MongoClient(process.env.MONGO_URL)
            client.connect((err, client) => {
                if (err) reject(err); 
        
                const db = client.db('puglies')
                const collection = db.collection('testClaimed')
                collection.insertOne(nft, (err, result) =>  {
                    if (err) reject(err)

                    client.close()
                    resolve(result)
                })
            })
        })

        return promise

    }

}
