import AWS from "aws-sdk";
import { v4 as uuid } from 'uuid';
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
export async function storeMessage(address, message) {
    const sortID = `${Date.now()}-${uuid()}`;
    const item = { address, sortID, message };
    const params = {
        TableName: 'Messages',
        Item: item,
    };
    try {
        const result = await dynamoDB.put(params).promise();
        console.log(JSON.stringify(result));
        return item;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
export async function getMessagesAfter(address, timestamp) {
    const params = {
        TableName: 'Messages',
        KeyConditionExpression: `#hkey = :hkey and #rkey > :rkey`,
        ExpressionAttributeValues: {
            ':hkey': address,
            ':rkey': `${timestamp}`,
        },
        ExpressionAttributeNames: {
            '#hkey': 'address',
            '#rkey': 'sortID',
        },
    };
    try {
        const result = await dynamoDB.query(params).promise();
        console.log(JSON.stringify(result));
        if (result.Items.length > 0) {
            const items = result.Items;
            return items.map((item) => item.message);
        }
    }
    catch (error) {
        console.error(error);
    }
    return [];
}
export async function getMessagesBefore(address, timestamp) {
    const params = {
        TableName: 'Messages',
        KeyConditionExpression: `#hkey = :hkey and #rkey < :rkey`,
        ExpressionAttributeValues: {
            ':hkey': address,
            ':rkey': `${timestamp}`,
        },
        ExpressionAttributeNames: {
            '#hkey': 'address',
            '#rkey': 'sortID',
        },
    };
    try {
        const result = await dynamoDB.query(params).promise();
        console.log(JSON.stringify(result));
        if (result.Items.length > 0) {
            return result.Items;
        }
    }
    catch (error) {
        console.error(error);
    }
    return [];
}
export async function deleteMessagesBefore(address, timestamp) {
    const msgs = await getMessagesBefore(address, timestamp);
    const deleteRequests = msgs.map((msg) => ({
        DeleteRequest: { Key: { address, sortID: msg.sortID } },
    }));
    const params = {
        RequestItems: {
            ['Messages']: deleteRequests,
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
