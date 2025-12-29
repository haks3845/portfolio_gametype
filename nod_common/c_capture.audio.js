class CaptureAudio {
    #m_recorder;
    #m_size = 0;

    // onRecording = null;
    /**
     * 녹음을 시작한다.
     * @param {*} callback 시작시 콜백
     */
    start(callback) {
        this.#m_size = 0;

        let constraints = {
            audio: {
                sampleRate: 48000,
                channelCount: 0,
                volume: 1.0,
                echoCancellation: false,
                autoGainControl: false,
                noiseSuppression: false,
            },
        };
        // navigator.mediaDevices.getUserMedia({ audio: true }).then(function (mic) {
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then((mic) => {
                const options = {
                    type: "audio",
                    numberOfAudioChannels: 2,
                    checkForInactiveTracks: true,
                    bufferSize: 16384,
                };

                const audioTrack = mic.getAudioTracks()[0];
                const ctx = new AudioContext();
                let src = ctx.createMediaStreamSource(new MediaStream([audioTrack]));
                let dst = ctx.createMediaStreamDestination();
                let gainNode = ctx.createGain();
                gainNode.gain.value = 20;
                [src, gainNode, dst].reduce((a, b) => a && a.connect(b));
                mic.removeTrack(audioTrack);
                mic.addTrack(dst.stream.getAudioTracks()[0]);

                this.#m_recorder = RecordRTC(mic, options);
                this.#m_recorder.startRecording();
                // release mic on stopRecording
                this.#m_recorder.stream = mic;

                if (callback) callback();
            })
            .catch((error) => {
                alert("Unable to capture your camera. Please check console logs.");
                console.error(error);
            });
    }

    /**
     * 녹음을 종료한다.
     * @param {*} callback
     * @returns
     */
    stop(callback) {
        if (!this.#m_recorder) return;

        const stopRecordingCallback = (callback) => {
            getSeekableBlob(this.#m_recorder.getBlob(), function (seekableBlob) {
                let src = URL.createObjectURL(seekableBlob);

                this.#m_recorder.stream.stop();
                this.#m_recorder.destroy();
                this.#m_recorder = null;
                callback(src, seekableBlob);
            });
        };

        this.#m_recorder.stopRecording(() => {
            console.log(this);
            stopRecordingCallback(callback);
        });
    }
}

const captureAudio = new CaptureAudio();
