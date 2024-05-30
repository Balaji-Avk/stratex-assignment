import { Request, Response } from 'express';
import client from '../client';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import {signinSchema , signupSchema} from '../schema/seller';
const csvtojson = require("csvtojson");

export async function signin(req : Request, res : Response){
    await client.$connect();
    const body = await req.body;
    const payload = signinSchema.safeParse(body);
    if(!payload.success){
        return res.status(400).json({
            msg :"invalid schema"
        })
    };
    
    try{
        const userData = await client.seller.findFirst({
            where :{
                username : body.username
            }
        })

        bcrypt.compare(body.password,userData?.password)
            .then((response: any)=>{
                if(!response){
                    return res.status(409).json({
                        msg : "incorrect password"
                    })
                }
                const token = jwt.sign(userData?.sid , process.env.JWTSECRET);
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
    const body = await req.body;
    
    const payload = signupSchema.safeParse(body);

    if(!payload.success){
        return res.status(400).json({
            msg :"invalid schema"
        })
    };

    const userData = await client.seller.findFirst({
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
        
        const response = await client.seller.create({
            data :{
                username : body.username,
                email : body.email,
                password : hashedPassword
            }
        })
    
        const token = jwt.sign(response.sid , process.env.JWTSECRET);
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
export async function addBooks(req: Request, res : Response){
    await client.$connect();
    const file = req.file;

    const BooksData =await csvtojson().fromFile(file?.path);
    
    try{
        const sid = parseInt(req.headers['sid'] as string);

        if(!sid){
            return res.json({
                msg : "Invalid seller id"
            })
        }
        const seller = await client.seller.findFirst({
            where : {
                sid : sid
            }
        })
        
        if(!seller){
            return res.send("seller not found");
        }
        
        const formattedBooksData = BooksData.map((book : {title : string , author : string , publishedDate : string , price : string})=>({
            title : book.title,
            author : book.author,
            publishedDate : new Date(book.publishedDate),
            price : parseFloat(book.price),
            sid : sid
        }));
        
        await client.book.createMany({
            data : formattedBooksData
        });

        return res.status(200).json({
            msg : "uploaded successfully"
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            msg : "Internal server error"
        })
    }
}

export async function modify(req:Request , res : Response){
    try {
        const { bid, quantity, price ,title , author , publishedDate} = req.body;
        
        const book = await client.book.findUnique({
            where: { bid },
            select: { sid: true }
        });

        if (!book) {
            return res.status(404).json(
                { msg: "Book not found" }
            );
        }
        const sid = parseInt(req.headers['sid'] as string);
        
        if (book.sid !== sid) {
            return res.status(403).json(
                { msg: "You are not authorized to edit this book" }
            );
        }

        const updatedBook = await client.book.update({
            where: { bid },
            data: {
                quantity: quantity !== undefined ? quantity : undefined,
                price: price !== undefined ? price : undefined,
                title: title !== undefined ? title : undefined,
                author: author !== undefined ? author : undefined,
                publishedDate: publishedDate !== undefined ? new Date(publishedDate) : undefined
            }
        });

        return res.status(200).json({
            msg: "Book updated successfully", updatedBook 
        });
    } catch (error) {
        console.error("Error editing book:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
}

export async function deleteBook(req : Request , res : Response){
    try {
        const { bid }: {bid : number} = req.body;

        const book = await client.book.findUnique({
            where: { bid },
            select: { sid: true }
        });

        if (!book) {
            return res.status(404).json({ msg: "Book not found" });
        }

        const sid = parseInt(req.headers['sid'] as string);

        if (book.sid !== sid) {
            return res.status(403).json({ msg: "You are not authorized to delete this book" });
        }

        await client.book.delete({ where: { bid } });

        return res.status(200).json({ 
            msg: "Book deleted successfully" 
        });
    }
    catch (error) {
        console.error("Error deleting book:", error);
        return res.status(500).json({ 
            msg: "Internal server error" 
        });
    }
}