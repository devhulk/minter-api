import dotenv from 'dotenv'
dotenv.config()
import mongodb from 'mongodb';
const { MongoClient } = mongodb

export default class Repo {
    constructor() {
        this.url = dotenv.config().parsed.MONGO_URL;
        this.dbName = 'puglies'
    }
    async init() {
    }

    async getPuglies(cb, pageLimit = 10, start = 1) {
        await new MongoClient(this.url).connect((err, client) => {
            if (err) throw err;
            const db = client.db(this.dbName)
            db.collection('countryPugs').find({}).sort({edition: 1}).skip(start).limit(pageLimit).toArray((err, result) => {
                if (err) throw err;
                client.close()
                cb(result)
            })
        })
       
    }
    async insertOne() {}
    async insertMany(collectionName, metadata) {
        const db = this.client.db(this.dbName)
        const collection = db.collection(collectionName)
    
        const insertResult = await collection.insertMany(metadata);
        console.log('Inserted documents =>', insertResult);
    
        return insertResult

    }

}
