export interface SoundToolsMessage<T>{
    event: ServerEvents | ClientEvents;
    data: T;
}

export interface FileReadyMessage{
    type: string;
    path: string;
}

type ServerEvents = "received" | "error" | "complete";
type ClientEvents = "stop";