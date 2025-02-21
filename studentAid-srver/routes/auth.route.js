import express from "express";
import { OK } from '../constants/status.constants.js';
import * as controller from '../controllers/auth.controller.js';
import catcher from '../middleware/catcher.middleware.js';

const router = express.Router()

router.use("/health", (req, res) => {
    return res.sendStatus(OK);
});

router.post('/login', catcher(controller.login))
router.post('/register', catcher(controller.register))
router.post('/resend', catcher(controller.resendVerificationToken))
router.post('/forgot-password', catcher(controller.forgotPassword))
router.post('/reset-password/:token', catcher(controller.resetPassword))
router.get('/verify/:id', catcher(controller.verifyUser))




export default router