import { Request, Response } from "express";
import { listBooks, orderBooks, signin, signup } from "../controllers/user";
import { authMiddlewareUser } from "../middlewares/auth";
const express = require('express');
const router = express.Router();

router.get('/',(req :Request,res :Response) =>{
    return res.json({
        msg : "working"
    })
});

router.post('/signin',signin);
router.post('/signup',signup);

router.get('/view',listBooks);
router.post('/order',authMiddlewareUser,orderBooks);



module.exports = router;