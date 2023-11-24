<script setup lang="ts">
import { ref, reactive } from 'vue';
import AudioInfoItem from './AudioInfoItem.vue';
import AudioVisualizerBar from './AudioVisualizerBar.vue';
import { defaultApiStates, appAudioManager } from '@/states/AppStates';
import SelectionState from '@/states/SelectionStates';
import FileUtils from '@/utils/FileUtils';
import { AudioAccessWrapper, toTimeString } from "@/states/AudioManager";

// querySelectorAll("controls > div").length
const selectionState = reactive(new SelectionState());
const selectedAudio = ref<Set<AudioAccessWrapper>>(new Set());
const showingControlPanel = ref<boolean[]>([false, false, false, false]);

const longestDuration = ref<number>(appAudioManager.getLongestDurationAudio()?.element.duration || 0);
const progressNum = ref<number>(0);


function getIsSelected<T>(item: T){
    if(selectionState.isState("vocalremove_select") || selectionState.isState("combine_select")){
        // except for the selected one (to show a normal color)
        return !selectedAudio.value.has(item as AudioAccessWrapper);
    }
    // default view => show disabled
    return appAudioManager.isAudioDisabled(item as AudioAccessWrapper);
}

// Event Handlers
function onAudioTimeUpdate(e: Event){
    progressNum.value = appAudioManager.getLongestDurationAudio()!.getProgress();
}
function toggleControlPanel(index: number){
    showingControlPanel.value[index] = !showingControlPanel.value[index];
}
function importAudio(){
    FileUtils.requestLocalAudioFile((files)=>{
        for(let i = 0; i < files?.length; i++){
            const file = files.item(i);
            if(!file) continue;
            appAudioManager.addAudioSourceFromFile(file);
        }
        longestDuration.value = appAudioManager.getLongestDurationAudio()?.element.duration || 0;
    });
}
function onAudioVisualizerClick(audio: AudioAccessWrapper){
    if(selectionState.isState("enable_select")){
        appAudioManager.enableAudio(audio);
    }else if(selectionState.isState("disable_select")){
        appAudioManager.disableAudio(audio);
    }else if(selectionState.isState("combine_select") && selectedAudio.value.size < 2){
        selectedAudio.value.add(audio);
    }else if(selectionState.isState("vocalremove_select") && selectedAudio.value.size < 1){
        selectedAudio.value.add(audio);
    }
}
function doneSelecting(){
    if(selectionState.isState("combine_select")){
        if(selectedAudio.value.size != 2) return;

        const iterator = selectedAudio.value.values();
        defaultApiStates.simpleToolApi.mixAudio(iterator.next().value, iterator.next().value);
    }else if(selectionState.isState("vocalremove_select")){
        if(selectedAudio.value.size != 1) return;

        defaultApiStates.vocalRemoverApi.vocalRemove(selectedAudio.value.values().next().value);
    }

    selectedAudio.value.clear();
    selectionState.setState('none');
}
function cancelSelecting(){
    selectedAudio.value.clear();
    selectionState.setState('none');
}

</script>

<template>
    <div class="audio-viewer-main">
        <div class="controls" v-if="selectionState.isState('none')">
            <div class="player">
                <button class="menu-header" @click="()=>toggleControlPanel(0)">Player Controls</button>
                <div :class="['subitems', {'hidden': !showingControlPanel[0]}]">
                    <button @click="()=>appAudioManager.playAllSources(onAudioTimeUpdate)">Play</button>
                    <button @click="appAudioManager.stopAllSources">Stop</button>
                    <button @click="appAudioManager.resetAllSources">Reset</button>
                </div>
            </div>
            <div class="control">
                <button class="menu-header" @click="()=>toggleControlPanel(1)">Audio Controls...</button>
                <div :class="['subitems', {'hidden': !showingControlPanel[1]}]">
                    <button @click="()=>selectionState.setState('disable_select')">Disable</button>
                    <button @click="()=>selectionState.setState('enable_select')">Enable</button>
                    <button @click="()=>selectionState.setState('combine_select')">Combine</button>
                </div>
            </div>
            <div class="import">
                <button class="menu-header" @click="()=>toggleControlPanel(2)">Import...</button>
                <div :class="['subitems', {'hidden': !showingControlPanel[2]}]">
                    <button @click="importAudio">Import Audio</button>
                </div>
            </div>
            <div class="analyze">
                <button class="menu-header" @click="()=>toggleControlPanel(3)">Analyze...</button>
                <div :class="['subitems', {'hidden': !showingControlPanel[3]}]">
                    <button @click="()=>selectionState.setState('vocalremove_select')">Vocal Splitter</button>
                </div>
            </div>
        </div>
        <div class="controls selecting" v-else>
            <div class="control">
                <button class="menu-header" @click="()=>toggleControlPanel(1)">Selecting...</button>
                <button @click="doneSelecting">Done</button>
                <button @click="cancelSelecting">Cancel</button>
            </div>
        </div>
        <div class="content">
            <div class="left-panel">
                <AudioInfoItem v-for="audio in appAudioManager.getAudioSources()" :key="audio.name" :audio="audio">
                    {{ audio.getShortenedName(20) }}
                </AudioInfoItem>
            </div>
            <div class="right-panel">
                <AudioVisualizerBar v-for="(audio, i) in appAudioManager.getAudioSources()" :key="audio.name" :audio="audio" 
                    @click="onAudioVisualizerClick" :is-selected="getIsSelected(audio)"/>
                <div v-if="appAudioManager.length() > 0" class="progress-indicator" :style="{'left': `${progressNum*100}%`}">
                    <div class="progress-text">{{ appAudioManager.getLongestDurationAudio()?.getTimeString() || 0 }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
:root{
    --audio-item-height: 5rem;
}
</style>

<style scoped>
.audio-viewer-main{
    display: flex;
    flex-direction: column;
    min-width: 100vw;
    min-height: 100vh;
}
.controls{
    display: flex;
    gap: 2rem;
    padding-bottom: 2rem;
}
.controls > div, .subitems{
    display: flex;
    gap: 0.5rem;
}
.content{
    display: flex;
    width: max-content;
    padding-right: 1rem;
}
.left-panel, .right-panel{
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
}
.left-panel{
    width: 10rem;
    padding-right: 1rem;
}
.right-panel{
    position: relative;
}
.progress-indicator{
    position: absolute;
    margin-top: -0.5rem;
    left: 0;
    top: inherit;
    width: 0.1rem;
    height: 120%;

    border-radius: 0.5rem;
    background-color: rgba(255, 221, 221, 0.7);
}
.progress-text{
    position: absolute;
    margin-top: -1.5rem;
    margin-left: -0.2rem;
}
.hidden{
    display: none;
}
</style>