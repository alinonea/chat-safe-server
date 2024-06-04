import express from 'express';
import { getPublicPreKeyBundle, registerKeyBundle } from './keysDB';
const router = express.Router();
router.post('/:address', async function (req, res) {
    const { address } = req.params;
    const bundle = req.body;
    const registered = (await registerKeyBundle(address, bundle)) ? true : false;
    if (registered) {
        return res.status(200).send({
            message: "Key bundle succesfuly saved"
        });
    }
    return res.status(400).send({
        message: "Error while saving the key bundle"
    });
});
router.get('/:address', async function (req, res) {
    const { address } = req.params;
    const bundle = await getPublicPreKeyBundle(address);
    if (bundle) {
        return res.status(200).send(bundle);
    }
    return res.status(404).send({
        message: "Error while fetching the key bundle"
    });
});
export default router;
