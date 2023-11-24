<script setup lang="ts">
import AudioProcessUtils from '@/utils/AudioProcessUtils';
import {AudioAccessWrapper} from '@/states/AudioManager';
import SimpleCanvas from '@/utils/SimpleCanvas';
import { onMounted, ref } from 'vue';

const emit = defineEmits(["click"]);
/**
 * progress = range 0-1 (%)
 */
const props = defineProps<{audio: AudioAccessWrapper, showProgressText?: boolean, isSelected?: boolean}>();
const canvasEleRef = ref<HTMLCanvasElement>();
const progressNum = ref<number>(0);
props.audio.prepare();

onMounted(async ()=>{
    // onAudioTimeUpdate();

    props.audio.element.oncanplay = async ()=>{
        const normalizedWaveformNums = await visualizeAudio(props.audio.getSource(), Math.floor(props.audio.getDuration() * 10));

        const canvas = canvasEleRef.value!;
        const simpleCanvas = new SimpleCanvas(canvas);

        canvas.style.width = normalizedWaveformNums.length + "px";
        simpleCanvas.alignSizeWithCssStyle();
        simpleCanvas.middleYAsOrigin();
        simpleCanvas.style("rgb(255, 221, 221)", "rgb(255, 221, 221)");
        const width = canvas.offsetWidth / normalizedWaveformNums.length;
        simpleCanvas.fillRect(0, 0, canvas.offsetWidth, 1);
        for(let i = 0; i < normalizedWaveformNums.length; i++){
            let x = width * i;
            let height = normalizedWaveformNums[i] * (canvas.offsetHeight/2);
            simpleCanvas.fillRect(x, 0, width, height);
        }
    }

});

function onAudioTimeUpdate(){
    props.audio.addEventListener("timeupdate", (e)=>{
        progressNum.value = props.audio.getProgress()*100;
    });
}

async function visualizeAudio(url: string, duration: number): Promise<number[]>{
    return fetch(url, {credentials: "include"}).then(res => res.arrayBuffer()).then((arrayBuffer)=>{
        return AudioProcessUtils.decodeSampleNormalize(arrayBuffer, null, duration);
    });
}
</script>

<template>
    <div class="wrapper" :class="{'selecting': props.isSelected}" @click="(e)=>emit('click', props.audio)">
        <!-- <div class="progress-indicator" :style="{'left': `${progressNum}%`}">
            <div v-if="showProgressText" class="progress-text">{{ audio.getTimeString() }}</div>
        </div> -->
        <canvas ref="canvasEleRef"></canvas>
    </div>
</template>

<style scoped>
.selecting{
    filter: brightness(50%);
}
.selecting:hover{
    filter: brightness(80%);
}
</style>

<style scoped>
.wrapper{
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--audio-item-height);
}
/* .progress-indicator{
    width: 0.1rem;
    height: 120%;

    position: absolute;
    left: 0;
    top: inherit;
    border-radius: 0.5rem;
    background-color: rgb(255, 221, 221);
}
.progress-text{
    position: absolute;
    margin-top: -1.5rem;
    margin-left: -0.2rem;
} */
canvas{
    width: 100%;
    height: 100%;
    background-color: rgb(123, 182, 34);
    border-radius: 0.5rem;
}
</style>