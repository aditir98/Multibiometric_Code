import express from 'express';
import cors from 'cors';
// for all the http request
import Video from "./model/User.model.js";
import morgan from 'morgan';
import router from './router/route.js';
import connect from './database/conn.js';
// import {output} from './controllers/appController.js';
import svgCaptcha from "svg-captcha"
import multer from "multer"
import bodyParser from 'body-parser';

const app = express();

// middlewares
app.use(express.json({limit:'6000mb'}));
app.use(bodyParser.json({limit: '6000mb'}));

app.use(cors());
app.use(morgan('tiny'));
// less hackers know about my stack
app.disable('x-powered-by');

// port number on which I will be handling my backend
const port = 8080;

// http get request
app.get('/', (req,res) => {
    res.status(201).json("Home GET Request");
})


// API routes 
// api is a endpoint for all other routes
app.use('/api', router)


app.get('/captcha', function(req, res) {
    const captcha = svgCaptcha.create();
    // req.session.captcha = captcha.text; // Save the captcha text in the session
    res.json({
        text: captcha.text,
        svg: captcha.data,
      });
  });
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/videos');
    },
    filename: function (req, file, cb) {
      cb(null,  file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });
  
  app.post('/upload-video', upload.single('video'), function (req, res, next) {
    const file = req.file;
    if (!file) {
      const error = new Error('Please upload a video file');
      error.status = 400;
      return next(error);
    }
    res.send('Video uploaded successfully');
  });
  const storagel = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploadsl/login_videos');
    },
    filename: function (req, file, cb) {
      cb(null,  file.originalname);
    },
  });
  
  const uploadl = multer({ storage: storagel });
  
  app.post('/upload-video-login', uploadl.single('video'), function (req, res, next) {
    const file = req.file;
    if (!file) {
      const error = new Error('Please upload a video file');
      error.status = 400;
      return next(error);
    }
    res.send('Video uploaded successfully');
  });
  

// start server only when we have valid db connection
//connect fn. will return a promise so we will use 'then' here
//inside then we will call a callback function with try and catch
connect().then( () => {
    try{
        app.listen(port, () => {
            console.log(`Server connected to http://localhost:${port}`)
        })
    }catch(error){
        console.log('Cannot connect to the Server')
    }
}).catch(error => {
    console.log("Invalid database Connection !!!")
})



