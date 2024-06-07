import { Message } from './interfaces';
import { FullKeyBundle, KeyTableItem, MessageTableItem } from './interfaces';
import dbConnection from './mongodb'
import { v4 as uuid} from 'uuid'

export async function storeMessage(message: Message): Promise<MessageTableItem> {
    const db = await dbConnection()

    try {
        const result = await db.chatsafe.collections.messages.insertOne(message)
        console.log(JSON.stringify(result))
        return message
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function getMessagesAfter(roomId: string, timestamp: number): Promise<Object[]> {
    const db = await dbConnection()

    try {
        return await db.chatsafe.collections.messages.find({
            roomId,
            timestamp: {$gte: timestamp}
        }).toArray()
    } catch (error) {
        console.error(error)
    }
    return []
}