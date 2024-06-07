import dbConnection from './mongodb';
export async function registerKeyBundle(address, bundle) {
    const db = await dbConnection();
    const ts = new Date().getTime();
    console.log(db);
    const item = Object.assign(Object.assign({ address }, bundle), { created: ts, updated: ts });
    try {
        const result = await db.chatsafe.collections.rooms.insertOne(item);
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
        const result = await db.chatsafe.collections.rooms.findOne({ address });
        console.log(JSON.stringify(result));
        if (result.Items.length > 0) {
            return result.Items[0];
        }
    }
    catch (error) {
        console.error(error);
    }
    return null;
}
export async function getPublicPreKeyBundle(address) {
    const bundle = await getFullKeyBundle(address);
    if (!bundle) {
        return null;
    }
    const preKey = bundle.oneTimePreKeys.pop();
    if (preKey) {
        // remove it from the db
        // TODO: we have a race condition here and we could end up storing a key that another
        // request used.  Need to put this in a transaction.
        await replaceOneTimePreKeys(address, bundle.oneTimePreKeys);
    }
    const { registrationId, identityKey, signedPreKey } = bundle;
    return { registrationId, identityKey, signedPreKey, preKey };
}
export async function replaceOneTimePreKeys(address, prekeys) {
    const db = await dbConnection();
    const params = {
        TableName: "Keys",
        Key: { address },
        AttributeUpdates: {
            oneTimePreKeys: {
                Action: 'PUT',
                Value: prekeys,
            },
            updated: {
                Action: 'PUT',
                Value: Date.now(),
            },
        },
    };
    const result = await db.chatsafe.collections.keys.updateOne({ address }, {
        $set: {
            oneTimePreKeys: prekeys
        }
    });
    console.log(JSON.stringify(result));
}
