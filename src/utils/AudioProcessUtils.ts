export default class AudioProcessUtils{
    /**
     * Take channel 0 as data
     * @param arrayBuf raw data
     * @param outputSamples -1 if you do not want sampling
     * @returns 
     */
    static async decodeSampleNormalize(arrayBuf: ArrayBuffer, audioContext: AudioContext | null = null, outputSamples: number = 1500){
        if(!audioContext) audioContext = new AudioContext();

        return audioContext.decodeAudioData(arrayBuf)
            .then(audioBuf => {
                return AudioProcessUtils.sampleAudioBufferData(audioBuf, outputSamples);
            })
            .then(AudioProcessUtils.normalizeData);
    }

    static sampleAudioBufferData(audioBuf: AudioBuffer, outputSamples: number){
        // [[chan 1 data], [chan 2 data], ...] (often # of channel = 2)
        const allChannelData = [];
        for(let i = 0; i < audioBuf.numberOfChannels; i++){
            allChannelData.push(audioBuf.getChannelData(i));
        }
        const blockSizePerChannel = Math.floor(allChannelData[0].length / outputSamples);
        const blockSizeCombined = blockSizePerChannel * audioBuf.numberOfChannels;
        const filteredData = [];
        for(let i = 0; i < outputSamples; i++){
            // take the average of the block (of ALL channels) -> turn it into one data
            let blockAnchorI = blockSizePerChannel * i;
            let total = 0;
            for(let chan = 0; chan < audioBuf.numberOfChannels; chan++){
                for(let j = 0; j < blockSizePerChannel; j++){
                    total += allChannelData[chan][blockAnchorI + j];
                }
            }
            filteredData.push(total / blockSizeCombined);
        }
        return filteredData;
    }
    
    static normalizeData(data: number[]){
        let largestNum = 0;
        for(let num of data){
            if(Math.abs(num) > largestNum)
                largestNum = num;
        }
        return data.map(num => num / largestNum);
    }
}