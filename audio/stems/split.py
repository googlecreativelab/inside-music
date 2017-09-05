from pydub import AudioSegment
import os
import tempfile
from os.path import basename
import random
import string
import sys

def tmp_wav():
    return (''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8))) + ".wav"

# split the track up in 30 second segments
def split_track(folder, track_name, out_path):
    segment = 0
    print folder, track_name
    # normalize the wave file
    tmp_audio = tmp_wav()
    os.system("ffmpeg -i %s/%s.wav -sample_fmt s16 -ac 1 -sample_rate 44100 %s" % (folder, track_name, tmp_audio))
    track = AudioSegment.from_wav(tmp_audio)
    while segment * 30 < track.duration_seconds:
        seg_audio = track[segment*30000:(segment+1)*30005]
        tmp = tmp_wav()
        seg_audio.fade_out(5).export(tmp, format="wav")
        # convert the sample rate and channel numbers
        # os.system("ffmpeg -y -i %s -codec:a libmp3lame -q:a 4 %s/%s-%d.mp3 " % (tmp, out_path, track_name, segment))
        # os.system("ffmpeg -y -i %s -codec:a vorbis -aq 50 %s/%s-%d.mp3 " % (tmp, out_path, track_name, segment))
        os.system("xld -o %s/%s-%d.mp3 --samplerate=44100 -f mp3 --channels=1 --correct-30samples %s" % (out_path, track_name, segment, tmp))
        os.system("xld -o %s/%s-%d.ogg --samplerate=44100 -f vorbis --channels=1 --correct-30samples %s" % (out_path, track_name, segment, tmp))
        os.remove(tmp)
        segment+=1
        print track_name, segment
    os.remove(tmp_audio)

# go through and run the split track on each track
def split_song(folder):
    out_path = "../%s" % (folder)
    print folder
    if not os.path.exists(out_path):
        os.makedirs(out_path)
    # get all of the tracks in the folder
    for file in os.listdir(folder):
        if file.endswith(".wav"):
            split_track(folder, os.path.splitext(file)[0], out_path)

if __name__ == "__main__":
    split_song(sys.argv[1])

