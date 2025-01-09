# Multibiometric_Code

### Algorithms in the code


 backend/extractFrames : Implementation of the algorithm for frame extraction from video saved in the database

 backend/extractFrames_login : Frame extraction algorithm but for the video recorded at login

 backend/matchFrames.py : Implementation of the algorithm for frame matching which in turn uses hamming distance present in _backend/hamming.py_. Matches the frames extracted from above two algorithms

backend/extractAudio.py: This contains the implementation of the Algorithm for extracting audio from Video stored in the database at the time of registration

 backend/extractAudio_login.py: This contains the implementation of the Algorithm for extracting audio from live video recorded during login 

 backend/matchAudio.py : Implementation of the algorithm for audio matching. Matches the audio extracted from above two steps
 
 backend/speechToTexty.py : Conatins implementation for converting audio extracted at login to Text to validate it matches the CAPTCHA displayed at login window

 ~~backend/speechToText.py~~ : No longer used in code

 ### Samples

 
