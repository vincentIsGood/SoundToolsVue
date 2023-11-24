import DownloadUtils from "@/utils/DownloadUtils";
import FileUtils from "@/utils/FileUtils";

export default class AudioManager{
    audioElements: Array<AudioAccessWrapper>;
    disabledAudio: Set<AudioAccessWrapper>;
    longestAudio: AudioAccessWrapper | null;
    longestAudioTimeUpdateCallback: (ev: Event)=>void;
    
    isPlaying: boolean = false;

    constructor(){
        this.audioElements = [];
        this.disabledAudio = new Set();
        this.longestAudio = null;
        this.longestAudioTimeUpdateCallback = ()=>{};
    }

    /**
     * Example:
     * ```js
     * appAudioManager.addAudioSource("http://127.0.0.1:1234/song.mp3");
     * ```
     * @param name make it unique
     */
    async addAudioSource(src: string, name?: string): Promise<AudioAccessWrapper>{
        if(!name){
            try{
                const url = new URL(src);
                name = url.pathname.substring(url.pathname.lastIndexOf('/')+1);
            }catch(e){
                name = "audio" + Math.floor(Math.random()*100000000);
            }
        }
        const audioEle = document.createElement("audio");
        audioEle.src = src;
        audioEle.controls = false;
        audioEle.preload = "auto";
        document.body.querySelector(".hidden-media")?.appendChild(audioEle);

        const mediaType = await fetch(src, {method: "HEAD", credentials: "include"})
            .then(res => res.headers.get("content-type")) || "application/octet-stream";
        const audioAccessElement = new AudioAccessWrapper(name, mediaType, audioEle);
        this.audioElements.push(audioAccessElement);

        this.deleteAudioSourceOnError(audioAccessElement);
        return audioAccessElement;
    }
    addAudioSourceFromFile(file: File): AudioAccessWrapper{
        const name = file.name;
        const audioEle = document.createElement("audio");
        audioEle.src = URL.createObjectURL(file);
        audioEle.controls = false;
        audioEle.preload = "auto";
        document.body.querySelector(".hidden-media")?.appendChild(audioEle);

        const audioAccessElement = new AudioAccessWrapper(name, file.type, audioEle);
        this.audioElements.push(audioAccessElement);

        this.deleteAudioSourceOnError(audioAccessElement);
        return audioAccessElement;
    }
    deleteAudioSourceOnError(audioAccessElement: AudioAccessWrapper){
        audioAccessElement.element.addEventListener("error", ()=>{
            this.audioElements.splice(this.audioElements.indexOf(audioAccessElement), 1);
            audioAccessElement.element.remove();
        });
    }



    disableAudio(audioAccessElement: AudioAccessWrapper){
        if(this.disabledAudio.has(audioAccessElement)) return;
        this.disabledAudio.add(audioAccessElement);
        this.updateLongestAudio();

        audioAccessElement.element.currentTime = this.getCurrentTime();
        audioAccessElement.pause();
    }
    enableAudio(audioAccessElement: AudioAccessWrapper){
        if(!this.disabledAudio.has(audioAccessElement)) return;
        this.disabledAudio.delete(audioAccessElement);
        audioAccessElement.element.currentTime = this.getCurrentTime();
        this.updateLongestAudio();
    
        this.syncAllSources();
        if(this.isPlaying){
            audioAccessElement.element.play();
        }
    }
    isAudioDisabled(audioAccessElement: AudioAccessWrapper){
        return this.disabledAudio.has(audioAccessElement);
    }



    getAudioSources(){
        return this.audioElements;
    }

    findLongestDurationAudio(){
        let longest = 0;
        let longestAudio = null;
        for(let audio of this.audioElements){
            if(audio.element.duration > longest && !this.isAudioDisabled(audio)){
                longest = audio.element.duration;
                longestAudio = audio;
            }
        }
        return longestAudio;
    }
    updateLongestAudio(){
        if(this.longestAudio){
            this.longestAudio.element.removeEventListener("timeupdate", this.longestAudioTimeUpdateCallback);
        }
        this.longestAudio = this.findLongestDurationAudio();
        if(!this.longestAudio) return;
        this.longestAudio.element.addEventListener("timeupdate", this.longestAudioTimeUpdateCallback);
    }
    getLongestDurationAudio(){
        return this.longestAudio;
    }

    getCurrentTime(){
        return this.longestAudio?.element.currentTime || 0;
    }

    length(){
        return this.audioElements.length;
    }


    syncAllSources(){
        for(let source of this.audioElements){
            if(!this.disabledAudio.has(source))
                source.element.currentTime = this.getCurrentTime();
        }
    }
    playAllSources(ontimeupdate: (ev: Event)=>void){
        this.longestAudioTimeUpdateCallback = ontimeupdate;
        this.updateLongestAudio();
        
        for(let source of this.audioElements){
            if(!this.disabledAudio.has(source))
                source.prepare();
        }
        for(let source of this.audioElements){
            if(!this.disabledAudio.has(source))
                source.play();
        }
        this.isPlaying = true;
    }

    stopAllSources(){
        for(let source of this.audioElements){
            if(!this.disabledAudio.has(source))
                source.pause();
        }
        this.isPlaying = false;
    }

    resetAllSources(){
        for(let source of this.audioElements){
            if(!this.disabledAudio.has(source))
                source.reset();
        }
        this.isPlaying = false;
    }
}

declare type AudioEventCallback = {
    event: keyof HTMLMediaElementEventMap;
    callback: Function;
}

class AudioAccessWrapper{
    readonly element: HTMLAudioElement;
    readonly mediaType: string;
    name: string;
    displayName: string;
    registeredCallbacks: Array<AudioEventCallback>;
    prepared: boolean = false;

    constructor(name: string, mediaType: string, element: HTMLAudioElement){
        this.name = name;
        this.displayName = name;
        this.element = element;
        this.mediaType = mediaType;
        this.registeredCallbacks = [];
    }

    prepare(){
        if(this.prepared) return;
        this.element.load();
        this.element.currentTime = 0;
        this.prepared = true;
    }

    play(){
        this.element.play();
    }

    pause(){
        this.element.pause();
    }

    reset(){
        this.element.pause();
        this.element.currentTime = 0;
    }

    addEventListener(event: keyof HTMLMediaElementEventMap, callback: (this: HTMLAudioElement, ev: Event) => any){
        this.registeredCallbacks.push({event, callback});
        this.element.addEventListener("timeupdate", callback);
    }

    downloadAudio(){
        DownloadUtils.downloadSrc(this.getSource(), this.displayName);
    }

    /**
     * @param volume 0-1
     */
    setVolume(volume: number){
        if(volume > 1) volume = 1;
        else if(volume < 0) volume = 0;
        this.element.volume = volume;
    }

    getShortenedName(maxLen: number = 15){
        const halfMaxLen = Math.floor(maxLen/2);
        return this.name.length > maxLen? 
            `${this.name.substring(0, halfMaxLen)}...${this.name.substring(this.name.length-halfMaxLen)}` : 
            this.name;
    }

    getSource(){
        return this.element.src;
    }

    getDuration(){
        return this.element.duration;
    }

    /**
     * @returns 0-1 value
     */
    getProgress(){
        if(!this.element.duration) return 0;
        return this.element.currentTime / this.element.duration;
    }

    getTime(){
        return this.element.currentTime;
    }

    /**
     * @returns current time string
     */
    getTimeString(){
        return toTimeString(this.element.currentTime);
    }
}

export function toTimeString(time: number){
    const sec = time % 60;
    const min = Math.floor(time / 60) % 60;
    const hr = Math.floor(time / 60 / 24) % 24;
    return `${hr}:${min}:${sec.toFixed(2)}`;
}

export {AudioAccessWrapper, type AudioEventCallback};