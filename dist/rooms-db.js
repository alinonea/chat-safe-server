import dbConnection from './mongodb';
export async function createRoom(room) {
    const db = await dbConnection();
    return await db.chatsafe.collections.rooms.insertOne(room);
}
export async function getUserRooms(username) {
    const db = await dbConnection();
    return await db.chatsafe.collections.rooms.find({
        users: username
    }).toArray();
}
export async function getRoomByCredentials(name, password) {
    const db = await dbConnection();
    return await db.chatsafe.collections.rooms.findOne({ _id: `${name}-${password}` });
}
export async function joinRoom(_id, username) {
    const db = await dbConnection();
    return await db.chatsafe.collections.rooms.updateOne({ _id }, {
        $set: { isFull: true },
        $push: { users: username }
    });
}
