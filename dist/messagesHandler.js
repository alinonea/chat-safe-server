import express from 'express';
import { getMessagesAfter, storeMessage } from './messagesDB';
const router = express.Router();
router.get('/:address', async function (req, res) {
    const { address } = req.params;
    const { after } = req.query;
    const messages = await getMessagesAfter(address, parseInt(after));
    return res.status(200).send(messages);
});
router.post('/:address', async function (req, res) {
    const { address } = req.params;
    const message = req.body.message;
    const item = await storeMessage(address, message);
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
