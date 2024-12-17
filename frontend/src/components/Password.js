import React, {useState,useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {toast, Toaster} from 'react-hot-toast'
import {useFormik} from 'formik'
import { useReactMediaRecorder } from "react-media-recorder";

import './element.css'
import { SHA256 } from 'crypto-js';
import { verifyPassword } from '../helper/helper'
import useFetch from '../hooks/fetch.hook'
import { useAuthStore } from '../store/store'
import axios from "axios"

import { passwordValidate } from '../helper/validate'
import avatar from '../assets/profile.jpg'
import styles from '../styles/Username.module.css'


function Password() {
    const [isSuccessful, setIsSuccessful] = useState(false);
    const navigate = useNavigate();

    const {username} = useAuthStore(state => state.auth)
    const[{isLoading, apiData, serverError}] = useFetch(`/user/${username}`)

    const [URL, setURL] = useState();

    const { status, startRecording, stopRecording, mediaBlobUrl } =
        useReactMediaRecorder({ video: true });

    const onClick = async() => {
        // const url = mediaBlobUrl;
        // setURL(url);
        // console.log(url)
        // console.log(url);
        // const response = await fetch(mediaBlobUrl);
        // const blob = await response.blob();
        // const binaryData = await new Promise((resolve) => {
        // const reader = new FileReader();
        // reader.onload = () => {
        //     resolve(reader.result);
        //     };
        // reader.readAsBinaryString(blob);
        // });
        // setURL(binaryData);
        const path="D:\\m.tech\\Project_1\\login_system\\backend\\uploadsl\\login_videos\\";
     setURL(path)
    }

const [captchaText, setCaptchaText] = useState('');

useEffect(() => {
  // Make an API call to the backend to generate the captcha
  axios.get('http://localhost:8080/captcha')
    .then(response => {
    //   console.log(response.data); // Check if the captcha text is received properly
      setCaptchaText(response.data.svg); // Set the captcha text in the state
    })
    .catch(error => console.log(error));
}, []);
 

  
    const formik = useFormik({
        initialValues: {
            password: '',
            url: '',
        },
        validate: passwordValidate,
        validateOnBlur: false,
        validateOnChange: false,
        onSubmit: async values => {
            values = await Object.assign(values, {url :URL})
            console.log(values);
            let loginPromise = verifyPassword({username, password : values.password,url:values.url})
            toast.promise(loginPromise,{
                loading: 'Checking...',
                success: <b>Login Successfully !!!</b>, 
                error: <b>Login UnSuccessful !!!</b>
                
            });
            
            loginPromise.then(res => {
                let {token} = res.data;
                localStorage.setItem('token',token);
                console.log(values)
                setIsSuccessful(true);
                navigate('/profile')
            })
        
            
            const response = await fetch(mediaBlobUrl);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append('video', blob , username +"_l.mp4");
        
            const res = await fetch('http://localhost:8080/upload-video-login', {
              method: 'POST',
              body: formData
            });
        
            if (res.ok) {
              console.log('Video uploaded successfully!');
            } else {
              console.error('Error uploading video.');
            }    
        // const path="D:\\m.tech\\Project_1\\login_system\\backend\\uploadsl\\login_videos\\"+`${Date.now()}`+".mp4";
        //  setURL(path)
            
        }
    })

    if(isLoading) return <h1 className='text-2xl font-bold'>isLoading</h1>;
    if(serverError) return <h1 className='text-xl text-red-500'>{serverError.message}</h1>
    // console.log(captchaText); // Check if the captcha text is set properly in the state
  return (
    <div className='container mx-auto'>

        <Toaster position='top-center' reverseOrder={false}></Toaster>

        <div className='flex justify-center items-center h-fit'>
            <div className={styles.glass}>

                <div className='title flex flex-col items-center'>
                    <h4 className='text-5xl font-bold'>Hello {apiData?.firstName || apiData?.username}</h4>
                    <span className='py-4 text-xl w-2/3 text-center text-gray-500'>
                        Long time no see !!!
                    </span>
                </div>

                <form className='py-1'>
                    <div className='profile flex justify-center py-4'>
                        <img src={apiData?.profile || avatar} alt="avatar" className={styles.profile_img}/>
                    </div>

                    <br></br>

                    <div className='textbox flex flex-col items-center gap-6'>
                        <label htmlFor='password' className='text-center text-gray-500'>Enter your password to Log in</label>
                        <input {...formik.getFieldProps('password')} className={styles.textbox} type= "password" placeholder="Password"/>
                    </div>
                </form>

                <div>

                    <br></br>

                    <p className='text-center text-gray-500'>Status : {status}</p>
                    <br></br>

                    <video src={mediaBlobUrl} controls autoPlay loop />                    <br></br>
                
                    
    

                    <button className={styles.btn} style={{width:'180px', marginRight:'10px'}} onClick={startRecording}>Start Recording</button>
                    <button className={styles.btn} style={{width:'180px', marginLeft:'40px', marginRight:'40px'}} onClick={stopRecording}>Stop Recording</button>
                    <button className={styles.btn} style={{width:'180px', marginLeft:'10px'}} onClick={onClick}>save</button>
                    <br></br><br></br>


                    <p className='text-center text-gray-500'> Read out the Captcha while recording your video.</p>

                    {/* <span>
                        <Captcha/>
                    </span> */}
     

                    <div dangerouslySetInnerHTML={{ __html: captchaText }}></div>
        
                </div>

                <br></br>

                <button onClick={formik.handleSubmit } style={{width:'646px'}} className={`${styles.btn}`} type='submit'>Log in</button>
              

                <div className='text-center py-4'>
                        <span className='text-gray-500'>Forgot Password?<Link to='/recovery' className='text-red-500'> Recover now </Link></span>
                </div>

            </div>
        </div>
    </div>
  )
}

export default Password