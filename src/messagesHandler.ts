import express,{Request, Response} from 'express'
import { getMessagesAfter, storeMessage } from './messages-db'
import { AddMessageRequest, Message } from './interfaces'
const router = express.Router()

router.get('/:roomId', async function(req: Request, res: Response){
    const { roomId } = req.params
    const { after } = req.query

    const messages = await getMessagesAfter(roomId, parseInt(after))

    return res.status(200).send(messages)
})

router.post('/:rooomId', async function(req: Request, res: Response){
    const { roomId } = req.params
    const addMessageRequest: AddMessageRequest = req.body

    const message: Message = {
        roomId,
        address: addMessageRequest.address,
        message: addMessageRequest.message,
        timestamp: Date.now()
    }

    const item = await storeMessage(message)
   
    if(item){
        return res.status(200).send({
            "message": "Message sent succesfully."
        })
    }

    return res.status(500).send({
        "message": "Error while sending the message."
    })
})

export default router;