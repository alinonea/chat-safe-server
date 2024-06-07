import { Room } from './interfaces';
import dbConnection from './mongodb'

export async function createRoom(room: Room){
    const db = await dbConnection();

    return await db.chatsafe.collections.rooms.insertOne(room);
}

export async function getUserRooms(username: string){
    const db = await dbConnection();

    return await db.chatsafe.collections.rooms.find({
        users: username
    }).toArray()
}

export async function getRoomByCredentials(name: string, password: string){
    const db = await dbConnection();

    return await db.chatsafe.collections.rooms.findOne({_id: `${name}-${password}`});
}

export async function joinRoom(_id: string, username: string){
    const db = await dbConnection();

    return await db.chatsafe.collections.rooms.updateOne({_id},{
        $set: { isFull: true},
        $push : {users: username}
    });
}