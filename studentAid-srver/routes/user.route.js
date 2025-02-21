import express from "express";
import { OK } from '../constants/status.constants.js';
import * as controller from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import catcher from '../middleware/catcher.middleware.js';

const router = express.Router()

router.use("/health", (req, res) => {
    return res.sendStatus(OK);
});

router.route('/')
    .all(auth)
    .get(catcher(controller.getOwnProfile))
    .delete(catcher(controller.deleteOwnProfile))


router.put('/update-password', auth, catcher(controller.updatePassword))

export default router