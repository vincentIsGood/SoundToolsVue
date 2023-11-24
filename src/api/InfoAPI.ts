import { appAudioManager } from "@/states/AppStates";

export default class InfoAPI{
    origin: string;

    constructor(origin: string){
        this.origin = origin;
    }

    /**
     * Audio will be added into appAudioManager automatically
     */
    async fetchAvailableAudio(){
        const availableAudio: string[] = await fetch(this.origin + "/soundtools/v1/info", {
            credentials: "include"
        }).then(res=>res.json()); // I want Set-Cookie from server
        
        for(let audioFilename of availableAudio){
            appAudioManager.addAudioSource(this.origin + "/completedrequests/" + audioFilename);
        }
    }
}

export async function requireCookie(origin: string){
    return fetch(origin + "/soundtools/v1/info", {credentials: "include"});
}