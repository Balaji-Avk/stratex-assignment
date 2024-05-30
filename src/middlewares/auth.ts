import { NextFunction, Request, Response } from 'express';
import jwt = require('jsonwebtoken')

export function authMiddlewareUser(req :Request ,res : Response,next : NextFunction){
    const token = req.headers['authorization']?.split(' ')[1];
    const JWTsecret = process.env.JWTSECRET ;
    
    if(!token){
        return res.status(401).json({
            msg : "token not found , please login again"
        })
    }
    if(!JWTsecret){
        return res.status(500).json({
            msg : "internal server error"
        })
    }

    try{
        const payload = jwt.verify(token,JWTsecret) as string;
        req.headers['uid'] = payload ;
        return next();
    }
    catch(err){
        return res.status(403).json({
            msg : "Invalid token , Please login again"
        })
    }
    
}

export function authMiddlewareSeller(req :Request ,res : Response,next : NextFunction){
    const token = req.headers['authorization']?.split(' ')[1];
    const JWTsecret = process.env.JWTSECRET ;
    
    if(!token){
        return res.status(401).json({
            msg : "token not found , please login again"
        })
    }
    if(!JWTsecret){
        return res.status(500).json({
            msg : "internal server error"
        })
    }

    try{
        const payload = jwt.verify(token,JWTsecret) ;
        req.headers['sid'] = payload as string;
        return next();
    }
    catch(err){
        return res.status(403).json({
            msg : "Invalid token , Please login again"
        })
    }
    
}