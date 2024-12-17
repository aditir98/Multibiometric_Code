from deepspeech import Model 
import wave
import numpy as np
from pydub import AudioSegment
import io
import sys
model = Model('./deepspeech-0.9.3-models.pbmm')
model.enableExternalScorer('./deepspeech-0.9.3-models.scorer')


def convert_to_wav(mp3_file):
    audio = AudioSegment.from_mp3(mp3_file)
    audio = audio.set_frame_rate(16000)
    audio = audio.set_channels(1)
    audio = audio.set_sample_width(2)
    wav_file = io.BytesIO()
    audio.export(wav_file, format='wav')
    wav_file.seek(0)
    return wav_file

# Example usage
file=sys.argv[1]
audio_file = convert_to_wav(file)
fin = wave.open(audio_file, 'rb')
audio = np.frombuffer(fin.readframes(fin.getnframes()), np.int16)
fin.close()# Perform inference
infered_text = model.stt(audio)

print(infered_text)
