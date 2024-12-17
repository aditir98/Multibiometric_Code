import React,{useState,useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast,{Toaster} from 'react-hot-toast'
import {useFormik} from 'formik'
import { useReactMediaRecorder } from "react-media-recorder";
import CaptchaTest from './captcha';
// import VideoRecorder from './recording';
import './element.css'
import { registerUser } from '../helper/helper'
import convertToBase64 from '../helper/convert'
import { registerValidation } from '../helper/validate'
import avatar from '../assets/profile.jpg'
import styles from '../styles/Username.module.css'
import extend from '../styles/Profile.module.css'
import axios from "axios"

function Register() {

    const navigate = useNavigate()    
    const[file, setFile] = useState()

    const [URL, setURL] = useState();

    const { status, startRecording, stopRecording, mediaBlobUrl } =
        useReactMediaRecorder({ video: true });

    
    const onClick = async(values) => {
        // const response = await fetch(mediaBlobUrl);
        // const blob = await response.blob();
        // const binaryData = await new Promise((resolve) => {
        // const reader = new FileReader();
        // reader.onload = () => {
        //     resolve(reader.result);
        //     };
        // reader.readAsBinaryString(blob);
        // });
        // console.log(binaryData);
        // setURL(binaryData); 
        // const blob = await fetch(mediaBlobUrl).then((res) => res.blob());
    //     const formData = new FormData();
    //     formData.append('video', blob , values.username+"my-video-file.mp4");
    
    //     const res = await fetch('http://localhost:8080/upload-video', {
    //       method: 'POST',
    //       body: formData
    //     });
    
    //     if (res.ok) {
    //       console.log('Video uploaded successfully!');
    //     } else {
    //       console.error('Error uploading video.');
    //     }    
    const path="D:\\m.tech\\Project_1\\login_system\\backend\\uploads\\videos\\";
     setURL(path)
    }



    const formik = useFormik({
        initialValues: {
            email: '',
            username: '',
            password: '',
            url: ''
        },
        validate: registerValidation,
        validateOnBlur: false,
        validateOnChange: false,
        onSubmit: async values => {
            //values is an object and profile is a property assigned to it whose value will be value of file
            values = await Object.assign(values, {profile :file || ''}, {url :URL})
            console.log(values)
            let registerPromise = registerUser(values);
            toast.promise(registerPromise, {
                loading: 'Creating..',
                success: <b>Register Succesfully !!!</b>,
                error: <b>Could not Register.</b>
            });
            registerPromise.then(function(){navigate('/')});
            const response = await fetch(mediaBlobUrl);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append('video', blob , values.username+".mp4");
        
            const res = await fetch('http://localhost:8080/upload-video', {
              method: 'POST',
              body: formData
            });
        
            if (res.ok) {
              console.log('Video uploaded successfully!');
            } else {
              console.error('Error uploading video.');
            }    
        const path="D:\\m.tech\\Project_1\\login_system\\backend\\uploads\\videos";
         setURL(path)
        
        }
    })

    //because formik doesn't support file input
    // const onUpload = async e => {
    //     const base64 = await convertToBase64(e.target.files[0]);
    //     setFile(base64);
    // }

    return (
    <div className='container mx-auto'>

        <Toaster position='top-center' reverseOrder={false}></Toaster>

        <div className='flex justify-center items-center h-fit'>
            <div className={styles.glass} style={{width: "45%", paddingTop:'3em'}}>

                <div className='title flex flex-col items-center'>
                    <h4 className='text-5xl font-bold' style={{marginLeft:'50px', marginRight:'50px'}}>Register</h4>
                    <span className='py-4 text-xl w-2/3 text-center text-gray-500'>
                        Happy to join you!
                    </span>
                </div>

                <form className='py-1' >

                    <div className='profile flex justify-center py-4'>
                        <label htmlFor='profile'>
                        <img src={file || avatar} alt="avatar" className={styles.profile_img} style={{marginLeft:"30px"}}/>
                        {/* <p className='text-gray-500' >Click to select your photo.</p> */}
                        </label>
                        {/* <input onChange={onUpload} type="file" id='profile' name='profile'/> */}
                    </div>

                    <div className='textbox flex flex-col items-center gap-6'>
                    
                        <br></br>

                        <div className="name flex w-4/4 gap-10">
                            <label className={`${styles.textbox} ${extend.textbox} ${'text-center text-gray-500'}`} style={{}}>Your Email :</label>                            
                            <input {...formik.getFieldProps('email')} className={`${styles.textbox} ${extend.textbox}`} style={{width: '370px'}} type="text" placeholder='Email' />
                        </div>

                        <div className="name flex w-4/4 gap-10">
                                <label className={`${styles.textbox} ${extend.textbox} ${'text-center text-gray-500'}`} style={{paddingBottom:'0px'}}>Your unique Username :</label>
                                <input {...formik.getFieldProps('username')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Username' />
                        </div>

                        {/* <label htmlFor='password' className={`${styles.textbox} ${extend.textbox} ${'text-center text-gray-500'}`}>Password</label>
                        <input {...formik.getFieldProps('password')} className={`${styles.textbox} ${extend.textbox}`} type="password" placeholder='abc&123' /> */}

                    </div>

                </form>

                <div>

                    <br></br>

                    <p className='text-center text-gray-500'>Status : {status}</p>
                    <br></br>
                    <video src={mediaBlobUrl} controls autoPlay loop />                    <br></br>
                    <p className='text-center text-gray-500'> Read out the Captcha while recording your video.</p>

                    <span>
                        <CaptchaTest />
                    </span>
                    <br></br>

                    <button className={styles.btn} style={{width:'180px', marginRight:'10px'}} onClick={startRecording}>Start Recording</button>
                    <button className={styles.btn} style={{width:'180px', marginLeft:'40px', marginRight:'40px'}} onClick={stopRecording}>Stop Recording</button>
                    <button className={styles.btn} style={{width:'180px', marginLeft:'10px'}} onClick={onClick}>save</button>
                
                </div>

                <br></br>

                <button onClick={formik.handleSubmit} style={{width:'646px'}} className={`${styles.btn}`} type='submit'>Register</button>
            


                <div className='text-center py-4'>
                        <span className='text-gray-500'>Already have an account? <Link to='/' className='text-red-500'> Sign in Now </Link></span>
                </div>

            </div>
        </div>
    </div>
  )
}


export default Register