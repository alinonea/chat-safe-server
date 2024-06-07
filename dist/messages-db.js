import dbConnection from './mongodb';
import { v4 as uuid } from 'uuid';
export async function storeMessage(address, message) {
    const db = await dbConnection();
    const sortID = `${Date.now()}-${uuid()}`;
    const item = { address, sortID, message };
    try {
        const result = await db.chatsafe.collections.messages.insertOne(item);
        console.log(JSON.stringify(result));
        return item;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
export async function getMessagesAfter(address, timestamp) {
    const db = await dbConnection();
    try {
        const result = await db.chatsafe.collections.messages.find({
            address: address,
            sortId: { $lte: timestamp }
        });
        console.log(JSON.stringify(result));
        if (result.Items.length > 0) {
            const items = result.Items;
            return items;
        }
    }
    catch (error) {
        console.error(error);
    }
    return [];
}
