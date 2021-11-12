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

}


let repo = new Repo()

repo.createCollection({collection: 'txsSeriesOne'})