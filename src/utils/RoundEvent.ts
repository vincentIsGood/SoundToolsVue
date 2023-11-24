export interface RoundEventListener{
    startProcessingCb?: ()=>void; 
    finishCallback?: ()=>void;
}