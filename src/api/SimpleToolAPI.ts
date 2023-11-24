import type { AudioAccessWrapper } from "@/states/AudioManager";
import { requireCookie } from "./InfoAPI";
import type { RoundEventListener } from "@/utils/RoundEvent";
import type { FileReadyMessage, SoundToolsMessage } from "./dto";
import FileUtils from "@/utils/FileUtils";
import { appAudioManager } from "@/states/AppStates";

export default class SimpleToolAPI{
    origin: string;
    host: string;

    constructor(origin: string){
        this.origin = origin;
        this.host = new URL(origin).host;
    }

    async mixAudio(audio1: AudioAccessWrapper, audio2: AudioAccessWrapper, listeners?: RoundEventListener){
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
                        appAudioManager.addAudioSource(this.origin + fileMsg.path);
                    }
                    if(listeners && listeners.finishCallback) 
                        listeners.finishCallback();
                default:
                    ws.close();
            }
        });
        ws.addEventListener("open", ()=>{
            fetch(this.origin + "/soundtools/v1/simple/combine?" + new URLSearchParams({
                a: audio1.name,
                b: audio2.name,
            }), {
                method: "POST",
                credentials: "include",
            });
        });
    }
}