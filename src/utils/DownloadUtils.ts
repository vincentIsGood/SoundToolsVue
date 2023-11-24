export default class DownloadUtils{
    /**
     * @param url supports blob url
     */
    static downloadSrc(url: string, name: string){
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = name;
        downloadLink.target = "_black";
        downloadLink.rel = "noreferer";
        downloadLink.click();
    }
}