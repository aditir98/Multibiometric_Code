import librosa
import numpy as np
from sklearn.metrics import pairwise_distances
import sys

file1=sys.argv[1]
file2 =sys.argv[2]
audio_file_1, sr_1 = librosa.load(r"{}".format(file1))
audio_file_2, sr_2 = librosa.load(r"{}".format(file2))

mfcc_1 = librosa.feature.mfcc(y=audio_file_1, sr=sr_1, n_mfcc=13)
mfcc_2 = librosa.feature.mfcc(y=audio_file_2, sr=sr_2, n_mfcc=13)

distance = pairwise_distances(mfcc_1.T, mfcc_2.T, metric='euclidean')

threshold = 200  
if (distance < threshold).all:
    # print("The audio files are from the same person.")
    print("yes")
else:
    # print("The audio files are from different persons.")
    print("no")
