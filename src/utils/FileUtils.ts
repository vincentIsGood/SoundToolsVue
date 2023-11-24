export default class FileUtils{
    static requestLocalAudioFile(callback: (files: FileList) => void){
        const inputFile = document.createElement("input");
        inputFile.type = "file";
        inputFile.accept = "audio/mp3, audio/wav";
        inputFile.click();
        inputFile.addEventListener("change", ()=>{
            if(!inputFile.files) return;
            if(callback) callback(inputFile.files);
            inputFile.remove();
        });
    }

    static extractFileExt(name: string){
        const dotLoc = name.lastIndexOf(".");
        return dotLoc == -1? "" : name.substring(dotLoc+1);
    }

    static extractFilename(path: string){
        const forwardSlash = path.lastIndexOf('/');
        return forwardSlash == -1? "" : path.substring(forwardSlash+1);
    }
}