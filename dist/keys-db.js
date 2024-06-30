import dbConnection from './mongodb';
export async function registerKeyBundle(address, bundle) {
    const db = await dbConnection();
    const ts = new Date().getTime();
    console.log(db);
    const item = Object.assign(Object.assign({ address }, bundle), { created: ts, updated: ts });
    try {
        const result = await db.chatsafe.collections.keys.insertOne(item);
        console.log(JSON.stringify(result));
        return address;
    }
    catch (error) {
        console.error(error);
        return '';
    }
}
export async function getFullKeyBundle(address) {
    const db = await dbConnection();
    try {
        return await db.chatsafe.collections.keys.findOne({ address });
    }
    catch (error) {
        console.error(error);
    }
    return null;
}
export async function getPublicPreKeyBundle(address) {
    const bundle = await getFullKeyBundle(address);
    console.log(bundle);
    if (!bundle) {
        return null;
    }
    // const preKey = bundle.oneTimePreKeys.pop()
    // if (preKey) {
    //     // remove it from the db
    //     // TODO: we have a race condition here and we could end up storing a key that another
    //     // request used.  Need to put this in a transaction.
    //     await replaceOneTimePreKeys(address, bundle.oneTimePreKeys)
    // }
    console.log(bundle);
    return bundle;
}
export async function replaceOneTimePreKeys(address, prekeys) {
    const db = await dbConnection();
    const result = await db.chatsafe.collections.keys.updateOne({ address }, {
        $set: {
            oneTimePreKeys: prekeys
        }
    });
    console.log(JSON.stringify(result));
}
