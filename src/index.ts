const express = require("express");
const userRouter = require('./routes/user');
const sellerRouter = require('./routes/seller');

const app = express();
app.use(express.json());

app.use('/user', userRouter);
app.use('/seller', sellerRouter);

app.listen(3000, () => {
    console.log("server is running");
});