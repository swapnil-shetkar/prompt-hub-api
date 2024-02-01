const express = require("express");
const mongoose = require('mongoose');   
require ("dotenv").config();   
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

//import routes
const authRoutes = require("./routes/authroutes.js");
const userRoutes = require("./routes/userroute.js");
const categoryRoutes = require("./routes/categoryroutes.js");
const productRoutes = require("./routes/productroutes.js");
const braintreeRoutes = require("./routes/braintreeroutes.js");
const orderRoutes = require("./routes/ordersroutes.js");
//app
const app = express();
//db
mongoose.connect(process.env.DATABASE,{
}).then(() => console.log("DB connected"));

//middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
// app.use(cors({
//     origin: 'http://localhost:3000/',
//     credentials: true, 
//   }));

//routes
app.use('/auth',authRoutes);
app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/product", productRoutes);
app.use("/braintree", braintreeRoutes);
app.use("/order", orderRoutes);

const port=process.env.PORT || 8000;
app.listen(port, () =>{
    console.log(`server is running on port ${port}`)
});