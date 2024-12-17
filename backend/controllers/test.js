const arg1 = videoPath + user.username + ".mp4";

const vr = spawn("python", ["./extractFrames.py", arg1]);

vr.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

vr.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

vr.on("close", (code) => {
  console.log(`extract frames child process exited with code ${code}`);
  const arg3 = videoPath_login + user.username + "_l.mp4";
  const vl = spawn("python", ["./extractFrameslogin.py", arg3]);

  vl.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  vl.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  vl.on("close", (code) => {
    console.log(`extract frames login child process exited with code ${code}`);
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
          console.log(`extract audio child process exited with code ${code}`);
          const al = spawn("python", ["./extractAudio_login.py", arg3]);

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
            const ma = spawn("python", ["./matchAudio.py", arg2, arg4]);

            ma.stdout.on("data", (data) => {
              console.log(`stdout: ${data}`);
              const output2 = data.toString().trim();
              if (output2 === "yes") {
                const st = spawn("python", ["./speechToTexty.py", arg4]);

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
              console.log(`match audio child process exited with code ${code}`);
            });
          });
        });
      }
    });
    mf.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    mf.on("close", (code) => {
      console.log(`match frames child process exited with code ${code}`);
    });
  });
});
