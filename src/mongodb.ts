import {MongoClient} from 'mongodb';
import dbConstants from './dbConstants'

const connect = async () => {
    return MongoClient.connect('mongodb://localhost:27017', {
        connectTimeoutMS: 600000,
        socketTimeoutMS: 600000
    });
};

const dbConnection = connect();

export default async () => {
    const client = await dbConnection;

    return Object.fromEntries(
        Object.keys(
            dbConstants.databases
        ).map(dbName => [
            dbName,
            {
                collections: Object.fromEntries(
                    dbConstants.databases[dbName].collections.map(collectionName => [
                        collectionName,
                        client.db(dbName).collection(collectionName)
                    ])
                )
            }
        ]).concat([[
            'closeConnection',
        ]])
    );
};