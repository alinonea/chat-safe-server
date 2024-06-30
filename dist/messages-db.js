import dbConnection from './mongodb';
export async function storeMessage(message) {
    const db = await dbConnection();
    try {
        const result = await db.chatsafe.collections.messages.insertOne(message);
        console.log(JSON.stringify(result));
        return message;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
export async function getMessagesAfter(roomId, timestamp) {
    const db = await dbConnection();
    try {
        return await db.chatsafe.collections.messages.find({
            roomId,
            timestamp: { $gte: timestamp }
        }).toArray();
    }
    catch (error) {
        console.error(error);
    }
    return [];
}
