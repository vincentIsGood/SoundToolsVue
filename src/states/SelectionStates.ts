type PredefinedStates = "none" | "selecting";

export default class SelectionState{
    currentState: PredefinedStates | string;

    constructor(){
        this.currentState = "none";
    }

    setState(newState: PredefinedStates | string){
        this.currentState = newState;
    }

    getState(){
        return this.currentState;
    }

    isState(state: PredefinedStates | string){
        return this.currentState == state;
    }
}