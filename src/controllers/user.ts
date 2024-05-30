import { Request, Response } from 'express';
import client from '../client';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import {signinSchema , signupSchema , orderSchema} from '../schema/user';
import { Prisma } from '@prisma/client';

export async function signin(req : Request, res : Response){
    await client.$connect();
    const body = await req.body;
    const payload = signinSchema.safeParse(body);
    if(!payload.success){
        return res.status(400).json({
            msg :"invalid schema"
        })
    };

    const userData = await client.user.findFirst({
        where :{
            username : body.username
        }
    })

    try{
        bcrypt.compare(body.password,userData?.password)
            .then((response: any)=>{
                if(!response){
                    return res.status(409).json({
                        msg : "incorrect password"
                    })
                }
                const token = jwt.sign(userData?.uid , process.env.JWTSECRET);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token',token);
                }
                return res.status(200).json({
                    msg : "login successful",
                    token : token
                })
            })
    }
    catch(err){
        return res.status(500).json({
            msg : "internal server error"
        })
    }
}
export async function signup(req : Request,res : Response){
    await client.$connect();
    const body = await req.body;
    const payload = signupSchema.safeParse(body);

    if(!payload.success){
        return res.status(400).json({
            msg :"invalid schema"
        })
    };

    const userData = await client.user.findFirst({
        where :{
            username : body.username
        }
    })

    if(userData){
        return res.status(201).json({
            msg : "user already exits"
        })
    }
    try{
        const hashedPassword = await bcrypt.hash(body.password ,10);
        const response = await client.user.create({
            data :{
                username : body.username,
                email : body.email,
                password : hashedPassword
            }
        })
    
        const token = jwt.sign(response.uid , process.env.JWTSECRET);
        if (typeof window !== 'undefined') {
            localStorage.setItem('token',token);
        }
        return res.status(200).json({
            msg : "login successful",
            token : token
        })
    }
    catch(err){
        return res.status(500).json({
            msg : "internal server error"
        })
    }
}

export async function listBooks(req : Request , res : Response){
    await client.$connect();
    try{
        const booksData = await client.book.findMany({});
        return res.status(200).json(booksData);
    }
    catch(err){
        return res.status(500).json({
            msg : "internal server error"
        })
    }
}

export async function orderBooks(req : Request , res : Response){
    await client.$connect();
    const body = await req.body;
    const payload = orderSchema.safeParse(body);
    if(!payload.success){
        return res.status(400).json({
            msg : "invalid schema"
        })
    }

    body.uid = parseInt(req.headers['uid'] as string);
    
    try{
        const bidValues = body.orderItems.map((item: { bid: any; }) => item.bid);
        const books = await client.book.findMany({
            where: {
                bid: {
                    in: bidValues
                }
            },
            select: {
                bid: true,
                price: true,
                quantity: true
            }
        });

        let totalAmount = 0;

        for (const item of body.orderItems) {
            const book = books.find((book) => book.bid === item.bid);
            if (book) {
                if (book.quantity < item.quantity) {
                    return res.status(400).json({
                        msg: `Insufficient quantity for book with bid ${item.bid}`
                    });
                }
                totalAmount += book.price * item.quantity;
            } else {
                return res.status(400).json({
                    msg: `Book with bid ${item.bid} not found`
                });
            }
        }

        await client.order_details.create({
            data: {
                uid: body.uid,
                amount: totalAmount,
                orderItems: {
                    create: body.orderItems.map((item: { sid: any; bid: any; quantity: any; }) => ({
                        sid: item.sid,
                        bid: item.bid,
                        quantity: item.quantity
                    }))
                }
            },
            include: {
                orderItems: true
            }
        });

        for (const item of body.orderItems) {
            await client.book.update({
                where: { bid: item.bid },
                data: {
                    quantity: {
                        decrement: item.quantity
                    }
                }
            });
        }
        return res.status(200).json({
            msg :"sucessfully ordered",
            amount: totalAmount
        })
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            msg : "Internal server error"
        })
    }
}
