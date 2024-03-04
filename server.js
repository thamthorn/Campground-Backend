const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');


dotenv.config({path:'./config/config.env'});

connectDB();

//Rate Limiting
const limiter = rateLimit({
    windowMs:10*60*1000,//10 mins
    max: 1000
})



const campgrounds = require ('./routes/campgrounds');
const booking = require('./routes/booking');
const auth = require('./routes/auth');
const coupon = require('./routes/coupon');
const app = express();



app.use(express.json());
//Enable CORS
app.use(cors());

//Prevent http param pollutions
app.use(hpp());
app.use(limiter);
app.use(xss());
app.use(helmet());
app.use(mongoSanitize());
app.use(cookieParser());
app.use('/api/v1/campgrounds',campgrounds);
app.use('/api/v1/booking',booking);
app.use('/api/v1/coupon', coupon);
app.use('/api/v1/auth',auth);


const PORT = process.env.PORT || 5000;
const server = app.listen(PORT,console.log('Server running in ', process.env.NODE_ENV, ' mode on port ' , PORT));

process.on('unhandledRejection',(err,promise) =>{
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
});