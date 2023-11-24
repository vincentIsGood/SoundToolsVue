import { reactive } from "vue";
import AudioManager from "./AudioManager";
import VocalRemover from "@/api/VocalRemover";
import InfoAPI from "@/api/InfoAPI";
import SimpleToolAPI from "@/api/SimpleToolAPI";

const ORIGIN = "https://127.0.0.1:8080";

class ApiStates{
    readonly infoApi: InfoAPI = new InfoAPI(ORIGIN);
    readonly simpleToolApi: SimpleToolAPI = new SimpleToolAPI(ORIGIN);
    readonly vocalRemoverApi: VocalRemover = new VocalRemover(ORIGIN);
}

const defaultApiStates = reactive(new ApiStates());
const appAudioManager = reactive(new AudioManager());

defaultApiStates.infoApi.fetchAvailableAudio();

export {defaultApiStates, appAudioManager}