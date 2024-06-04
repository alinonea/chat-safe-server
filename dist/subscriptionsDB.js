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
export async function addSubscription(sub, connectionID) {
    console.log('addSubscription', sub, connectionID, 'Subscriptions');
    const timestamp = new Date().getTime();
    const params = {
        TableName: 'Subscriptions',
        Item: {
            sub,
            connectionID,
            createdAt: timestamp,
        },
        Expected: { id: { Exists: false } },
    };
    try {
        const result = await dynamoDB.put(params).promise();
        console.log(JSON.stringify(result));
        return sub;
    }
    catch (error) {
        console.error(error);
    }
    return null;
}
export async function listConnectionIDsForSub(sub) {
    console.log(`listConnectionIDsForSub`, sub, 'Subscriptions');
    const params = {
        TableName: 'Subscriptions',
        KeyConditionExpression: '#hkey = :hkey',
        ExpressionAttributeValues: {
            ':hkey': sub,
        },
        ExpressionAttributeNames: {
            '#hkey': 'sub',
        },
    };
    try {
        const result = await dynamoDB.query(params).promise();
        console.log(JSON.stringify(result.Items));
        return result.Items.map((item) => item.connectionID);
    }
    catch (error) {
        console.error(error);
    }
    return [];
}
export async function getSubsForConnection(connectionID) {
    console.log(connectionID);
    const params = {
        TableName: 'Subscriptions',
        IndexName: `Subscriptions-cxn-index`,
        KeyConditionExpression: '#hkey = :hkey',
        ExpressionAttributeValues: {
            ':hkey': connectionID,
        },
        ExpressionAttributeNames: {
            '#hkey': 'connectionID',
        },
    };
    try {
        const result = await dynamoDB.query(params).promise();
        console.log(JSON.stringify(result.Items));
        return result.Items.map((item) => item.sub);
    }
    catch (error) {
        console.error(error);
    }
    return [];
}
export async function removeSubscriptionsForConnections(connectionID) {
    console.log(connectionID);
    const subs = await getSubsForConnection(connectionID);
    const deleteRequests = subs.map((sub) => ({ DeleteRequest: { Key: { sub, connectionID } } }));
    const params = {
        RequestItems: {
            ['Subscriptions']: deleteRequests,
        },
    };
    try {
        const result = await dynamoDB.batchWrite(params).promise();
        console.log(JSON.stringify(result));
    }
    catch (error) {
        console.error(error);
    }
}
