import z from "zod";

export const signinSchema = z.object({
    username : z.string(),
    password : z.string()
})

export const signupSchema = z.object({
    username : z.string(),
    email : z.string(),
    password : z.string()
})

export const orderItemSchema = z.object({
    bid : z.number(),
    sid : z.number(),
    quantity : z.number().positive()
});

export const orderSchema = z.object({
    orderItems : z.array(orderItemSchema)
})
