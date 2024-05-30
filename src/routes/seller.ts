import { Request, Response } from "express";
import { signin, signup, listBooks, addBooks, modify, deleteBook } from "../controllers/seller";
import { authMiddlewareSeller } from "../middlewares/auth";
const express = require('express');
const router = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

router.post('/signin',signin);
router.post('/signup',signup);


router.put('/insert',authMiddlewareSeller,upload.single('file'),addBooks);
router.get('/view',listBooks);
router.post('/modify',authMiddlewareSeller,modify);
router.delete('/delete',authMiddlewareSeller,deleteBook);
router.get('/',(req :Request,res :Response) =>{
    return res.json({
        msg : "done"
    })
})

module.exports = router;