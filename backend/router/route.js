import { Router } from "express";
// with this I can create different routes
const router = Router();

//import controllers
import * as controller from '../controllers/appController.js'
import { registerMail } from "../controllers/mailer.js";
import Auth,{localVariables} from "../middleware/auth.js";

// POST methods 
// endpoint for register will be /api/register
// inside post we need to determine the controllers
router.route('/register').post(controller.register) //register user
router.route('/registerMail').post(registerMail); //send the email
router.route('/authenticate').post(controller.verifyUser, (req,res) => res.end()); //authenticate user
router.route('/login').post(controller.verifyUser, controller.login); //log in app

// GET methods
router.route('/user/:username').get(controller.getUser); // user with username
router.route('/generateOTP').get(controller.verifyUser, localVariables ,controller.generateOTP); //generate random OTP
router.route('/verifyOTP').get(controller.verifyUser, controller.verifyOTP); //verify generated OTP
router.route('/createResetSession').get(controller.createResetSession); //reset all variables

// PUT methods
router.route('/updateuser').put(Auth, controller.updateUser); //to update the profile
router.route('/resetPassword').put(controller.verifyUser, controller.resetPassword); //to reset password

export default router;