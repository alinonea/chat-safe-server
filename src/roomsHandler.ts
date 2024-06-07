import express,{Request, Response} from 'express'
import { getMessagesAfter, storeMessage } from './messages-db'
import { CreateRoomRequest, JoinRoomRequest, Room } from './interfaces'
import { createRoom, getRoomByCredentials, getUserRooms, joinRoom } from './rooms-db'
const router = express.Router()

router.post('/', async function(req: Request, res: Response){
    const createRoomRequest: CreateRoomRequest = req.body

    const room: Room = {
        _id: `${createRoomRequest.name}-${createRoomRequest.password}`,
        users: [createRoomRequest.username],
        isFull: false
    }

    try{
        const result = await createRoom(room);
        return res.status(200).send({
            message: "Room succesfully created."
        })
    } catch(e) {
        return res.status(500).send({
            message: `Error while creating room: ${e}`
        })
    }    
})

router.post('/:username', async function(req: Request, res: Response){
    const { username } = req.params

    const joinRoomRequest: JoinRoomRequest = req.body

    try{
        const room = await getRoomByCredentials(joinRoomRequest.name, joinRoomRequest.password)

        if(!room){
            res.status(404).send({
                message: "A room with given credentials could not be found."
            })
        }

        if(room.isFull === true) {
            res.status(400).send({
                message: "The room is already full."
            })
        }

        const result = await joinRoom(`${joinRoomRequest.name}-${joinRoomRequest.password}`, username)
        return res.status(200).send({
            message: "User succesfully joined the room"
        })
    } catch(e) {
        return res.status(500).send({
            message: `Error while joining room: ${e}`
        })
    }
})

router.get('/:username', async function(req: Request, res: Response){
    const { username } = req.params

    try{
        const rooms = await getUserRooms(username)
        console.log(rooms)
        return res.status(200).send(rooms)
    } catch(e) {
        return res.status(500).send({
            message: `Error while getting user roooms: ${e}`
        })
    }
    
})

export default router