import UserModel from "../model/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV from "../config.js";
import otpGenerator from "otp-generator";
import { spawn } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";
import { log } from "console";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import request from "request";
import SHA256 from "crypto-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//middleware for verify user
export async function verifyUser(req, res, next) {
  try {
    const { username } = req.method == "GET" ? req.query : req.body;

    // check the user existance
    let exist = await UserModel.findOne({ username });
    if (!exist) return res.status(404).send({ error: "Can't find User!" });
    next();
  } catch (error) {
    return res.status(404).send({ error: "Authentication Error" });
  }
}

/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "profile": "",
  "url": "helloooooooo"
}
*/
export async function register(req, res) {
  try {
    const { username, password, profile, email, url } = req.body;

    // check the existing user
    const existUsername = new Promise((resolve, reject) => {
      UserModel.findOne({ username }, function (err, user) {
        if (err) reject(new Error(err));
        if (user) reject({ error: "Please use unique username" });

        resolve();
      });
    });

    // check for existing email
    const existEmail = new Promise((resolve, reject) => {
      UserModel.findOne({ email }, function (err, email) {
        if (err) reject(new Error(err));
        if (email) reject({ error: "Please use unique Email" });

        resolve();
      });
    });

    //resolving both the promises
    Promise.all([existUsername, existEmail])
      .then(() => {
        if (password) {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              //saving data in db
              const user = new UserModel({
                username,
                password: hashedPassword,
                profile: profile || "",
                email,
                url,
              });

              // return save result as a response
              user
                .save()
                .then((result) =>
                  res.status(201).send({ msg: "User Register Successfully" })
                )
                .catch((error) => res.status(500).send({ error }));
            })
            .catch((error) => {
              return res.status(500).send({
                error: "Enable to hashed password",
              });
            });
        }
      })
      .catch((error) => {
        return res.status(500).send({ error });
      });
  } catch (error) {
    return res.status(500).send(error);
  }
}

/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "url": "hellooo",
  "password" : "admin123"
}
*/
export async function login(req, res) {
  const { username, password, url } = req.body;

  try {
    UserModel.findOne({ username })
      .then((user) => {
        bcrypt
          .compare(password, user.password)
          .then((passwordCheck) => {
            if (!passwordCheck) {
              return res.status(400).send({ error: "Don't have Password" });
            }
            const videoPath = user.url;
            const videoPath_login = url;

            const arg1 = videoPath + user.username + ".mp4";

            const vr = spawn("python", ["./extractFrames.py", arg1]);

            vr.stdout.on("data", (data) => {
              console.log(`stdout: ${data}`);
            });

            vr.stderr.on("data", (data) => {
              console.error(`stderr: ${data}`);
            });

            vr.on("close", (code) => {
              console.log(
                `extract frames child process exited with code ${code}`
              );
              const arg3 = videoPath_login + user.username + "_l.mp4";
              const vl = spawn("python", ["./extractFrameslogin.py", arg3]);

              vl.stdout.on("data", (data) => {
                console.log(`stdout: ${data}`);
              });

              vl.stderr.on("data", (data) => {
                console.error(`stderr: ${data}`);
              });

              vl.on("close", (code) => {
                console.log(
                  `extract frames login child process exited with code ${code}`
                );
                const mf = spawn("python", ["./matchFrames.py"]);
                mf.stdout.on("data", (data) => {
                  console.log(`stdout: ${data}`);
                  const output = data.toString().trim();
                  if (output === "yes") {
                    const ar = spawn("python", ["./extractAudio.py", arg1]);

                    ar.stdout.on("data", (data) => {
                      console.log(`stdout: ${data}`);
                    });

                    ar.stderr.on("data", (data) => {
                      console.error(`stderr: ${data}`);
                    });

                    ar.on("close", (code) => {
                      console.log(
                        `extract audio child process exited with code ${code}`
                      );
                      const al = spawn("python", [
                        "./extractAudio_login.py",
                        arg3,
                      ]);

                      al.stdout.on("data", (data) => {
                        console.log(`stdout: ${data}`);
                      });
                      al.stderr.on("data", (data) => {
                        console.error(`stderr: ${data}`);
                      });

                      al.on("close", (code) => {
                        console.log(
                          `extract audio login child process exited with code ${code}`
                        );
                        const arg2 = videoPath + user.username + ".mp3";
                        const arg4 = videoPath_login + user.username + "_l.mp3";
                        const ma = spawn("python", [
                          "./matchAudio.py",
                          arg2,
                          arg4,
                        ]);

                        ma.stdout.on("data", (data) => {
                          console.log(`stdout: ${data}`);
                          const output2 = data.toString().trim();
                          if (output2 === "yes") {
                            const st = spawn("python", [
                              "./speechToTexty.py",
                              arg4,
                            ]);

                            st.stdout.on("data", (data) => {
                              console.log(`stdout: ${data}`);
                            });
                            st.stderr.on("data", (data) => {
                              console.error(`stderr: ${data}`);
                            });

                            st.on("close", (code) => {
                              console.log(
                                `speech to text child process exited with code ${code}`
                              );
                              const token = jwt.sign(
                                {
                                  userId: user._id,
                                  username: user.username,
                                },
                                ENV.JWT_SECRET,
                                { expiresIn: "24h" }
                              );

                              return res.status(200).send({
                                msg: "Login Successful...!",
                                username: user.username,
                                token,
                              });
                            });
                          }
                        });
                        ma.stderr.on("data", (data) => {
                          console.error(`stderr: ${data}`);
                        });

                        ma.on("close", (code) => {
                          console.log(
                            `match audio child process exited with code ${code}`
                          );
                        });
                      });
                    });
                  } else {
                    const token = jwt.sign(
                      {
                        userId: user._id,
                        username: user.username,
                      },
                      ENV.JWT_SECRET,
                      { expiresIn: "24h" }
                    );

                    return res.status(400).send({
                      msg: "Login UnSuccessful...!",
                      username: user.username,
                      token,
                    });
                  }
                });
                mf.stderr.on("data", (data) => {
                  console.error(`stderr: ${data}`);
                });

                mf.on("close", (code) => {
                  console.log(
                    `match frames child process exited with code ${code}`
                  );
                });
              });
            });

            // create jwt token
          })
          .catch((error) => {
            return res.status(400).send({ error: "Password does not Match" });
          });
      })
      .catch((error) => {
        return res.status(404).send({ error: "Username not Found" });
      });
  } catch (error) {
    return res.status(500).send({ error });
  }
}
/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
  const { username } = req.params;

  try {
    if (!username) return res.status(501).send({ error: "Invalid Username" });

    UserModel.findOne({ username }, function (err, user) {
      if (err) return res.status(500).send({ err });
      if (!user)
        return res.status(501).send({ error: "Couldn't Find the User" });

      /** remove password from user */
      // mongoose return unnecessary data with object so convert it into json
      const { password, ...rest } = Object.assign({}, user.toJSON());

      return res.status(201).send(rest);
    });
  } catch (error) {
    return res.status(404).send({ error: "Cannot Find User Data" });
  }
}

// pehle register //phir get data se saara data lena hai // then we will match data id
/** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req, res) {
  try {
    // const id = req.query.id;
    const { userId } = req.user;

    if (userId) {
      const body = req.body;

      // update the data
      UserModel.updateOne({ _id: userId }, body, function (err, data) {
        if (err) throw err;

        return res.status(201).send({ msg: "Record Updated...!" });
      });
    } else {
      return res.status(401).send({ error: "User Not Found...!" });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}

/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
}

/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // reset the OTP value
    req.app.locals.resetSession = true; // start session for reset password
    return res.status(201).send({ msg: "Verify Successsfully!" });
  }
  return res.status(400).send({ error: "Invalid OTP" });
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    //req.app.locals.resetSession = false; // by setting it false we will allow access to this route only once
    return res.status(201).send({ flag: req.app.locals.resetSession });
  }
  return res.status(440).send({ error: "Session expired!" });
}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ error: "Session expired!" });

    const { username, password } = req.body;

    try {
      UserModel.findOne({ username })
        .then((user) => {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              UserModel.updateOne(
                { username: user.username }, //selecting the user
                { password: hashedPassword },
                function (err, data) {
                  // resetting the password of the user
                  if (err) throw err;
                  req.app.locals.resetSession = false; // reset session
                  return res.status(201).send({ msg: "Record Updated...!" });
                }
              );
            })
            .catch((e) => {
              return res.status(500).send({
                error: "Enable to hashed password",
              });
            });
        })
        .catch((error) => {
          return res.status(404).send({ error: "Username not Found" });
        });
    } catch (error) {
      return res.status(500).send({ error });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}
