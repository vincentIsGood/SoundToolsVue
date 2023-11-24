import { appAudioManager } from "@/states/AppStates";
import type { AudioAccessWrapper } from "@/states/AudioManager";
import FileUtils from "@/utils/FileUtils";
import { requireCookie } from "./InfoAPI";
import type { FileReadyMessage, SoundToolsMessage } from "./dto";
import type { RoundEventListener } from "@/utils/RoundEvent";

export default class VocalRemover{
    origin: string;
    host: string;

    constructor(origin: string){
        this.origin = origin;
        this.host = new URL(origin).host;
    }

    /**
     * What it does
     * 1. loads the audio to audio manager.
     * 2. changes name of `audio` with uploaded server-side name
     */
    async vocalRemove(audio: AudioAccessWrapper, listeners?: RoundEventListener){
        await requireCookie(this.origin);
        
        const ws = new WebSocket(`wss://${this.host}/soundtools/v1/events`);
        ws.addEventListener("message", async (msg)=>{
            const serverRes = JSON.parse(msg.data) as SoundToolsMessage<FileReadyMessage[]>;
            switch(serverRes.event){
                case "received": 
                    if(listeners && listeners.startProcessingCb) 
                        listeners.startProcessingCb();
                break;
                case "complete":
                    for(let fileMsg of serverRes.data){
                        if(fileMsg.type === "original"){
                            audio.name = FileUtils.extractFilename(fileMsg.path);
                        }else appAudioManager.addAudioSource(this.origin + fileMsg.path);
                    }
                    if(listeners && listeners.finishCallback) 
                        listeners.finishCallback();
                default:
                    ws.close();
            }
        });
        ws.addEventListener("open", async ()=>{
            fetch(this.origin + "/soundtools/v1/vocalremover", {
                method: "POST",
                headers: {
                    "content-type": audio.mediaType,
                },
                credentials: "include",
                body: await fetch(audio.element.currentSrc, {credentials: "include"}).then(res=>res.arrayBuffer()),
            });
        })
    }
}
