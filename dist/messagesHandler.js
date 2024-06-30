import express from 'express';
import { getMessagesAfter, storeMessage } from './messages-db';
const router = express.Router();
router.get('/:roomId', async function (req, res) {
    const { roomId } = req.params;
    const { after } = req.query;
    const messages = await getMessagesAfter(roomId, parseInt(after));
    return res.status(200).send(messages);
});
router.post('/:rooomId', async function (req, res) {
    const { roomId } = req.params;
    const addMessageRequest = req.body;
    const message = {
        roomId,
        address: addMessageRequest.address,
        message: addMessageRequest.message,
        timestamp: Date.now()
    };
    const item = await storeMessage(message);
    if (item) {
        return res.status(200).send({
            "message": "Message sent succesfully."
        });
    }
    return res.status(500).send({
        "message": "Error while sending the message."
    });
});
export default router;
