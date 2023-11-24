<script setup lang="ts">
import type { AudioAccessWrapper } from '@/states/AudioManager';
import IconVolumeMedium from './icons/IconVolumeMedium.vue';
import IconDownloadFile from './icons/IconDownloadFile.vue';

const props = defineProps<{audio: AudioAccessWrapper}>();

function onVolumeChange(e: Event){
    const targetElement: HTMLInputElement = e.target as HTMLInputElement;
    props.audio.setVolume(parseInt(targetElement.value) / 100);
}

function onDownloadClick(){
    props.audio.downloadAudio();
}
</script>

<template>
    <div class="audio-info-item">
        <slot></slot>
        <div class="volume">
            <svg class="clickable vue-imported-icons" @click="onDownloadClick">
                <IconDownloadFile />
            </svg>
            <IconVolumeMedium />
            <input @input="onVolumeChange" id="volume-controller" type="range" min="0" max="100" value="100">
        </div>
    </div>
</template>

<style scoped>
.audio-info-item{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: var(--audio-item-height);
    gap: 0.5rem;
}
.volume{
    display: flex;
    align-items: center;
}
#volume-controller{
    width: 100%;
    height: 1rem;
    appearance: none;
    background-color: var(--vt-c-black-mute);
    border-radius: 0.5rem;
}
#volume-controller::-webkit-slider-thumb{
    appearance: none;
    width: 1rem;
    height: 1rem;
    border-radius: 100%;
    background-color: var(--vt-c-black-ish);
}
</style>