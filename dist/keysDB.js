import AWS from "aws-sdk";
let serviceConfigOptions = {
    region: "local",
    endpoint: "http://localhost:8000"
};
let dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: "us-west-2",
    accessKeyId: 'xxxx',
    secretAccessKey: 'xxxx',
    endpoint: "http://localhost:8000",
    convertEmptyValues: true
});
export async function registerKeyBundle(address, bundle) {
    const ts = new Date().getTime();
    const item = Object.assign(Object.assign({ address }, bundle), { created: ts, updated: ts });
    const params = {
        TableName: "Keys",
        Item: item,
        Expected: {
            address: {
                Exists: false,
            },
        },
    };
    try {
        const result = await dynamoDB.put(params).promise();
        console.log(JSON.stringify(result));
        return address;
    }
    catch (error) {
        console.error(error);
        return '';
    }
}
export async function getFullKeyBundle(address) {
    const params = {
        TableName: "Keys",
        KeyConditionExpression: '#hkey = :hkey',
        ExpressionAttributeValues: {
            ':hkey': address,
        },
        ExpressionAttributeNames: {
            '#hkey': 'address',
        },
    };
    try {
        const result = await dynamoDB.query(params).promise();
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
export async function replaceSignedPreKey(address, signedPublicPreKey) {
    const params = {
        TableName: process.env.KEY_BUNDLE_TABLE_NAME,
        Key: { address },
        AttributeUpdates: {
            signedPublicPreKey: {
                Action: 'PUT',
                Value: signedPublicPreKey,
            },
            updated: {
                Action: 'PUT',
                Value: Date.now(),
            },
        },
    };
    const result = await dynamoDB.update(params).promise();
    console.log(JSON.stringify(result));
}
export async function replaceOneTimePreKeys(address, prekeys) {
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
    const result = await dynamoDB.update(params).promise();
    console.log(JSON.stringify(result));
}
export async function removeAddress(address) {
    const params = {
        TableName: process.env.KEY_BUNDLE_TABLE_NAME,
        Key: {
            address,
        },
    };
    try {
        const result = await dynamoDB.delete(params).promise();
        console.log(JSON.stringify(result));
        return;
    }
    catch (error) {
        console.error(error);
    }
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
