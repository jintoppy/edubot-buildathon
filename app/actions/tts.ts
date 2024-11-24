'use server';

export const textToSpeech = (txt:string) => {
    const emptyAudioData = new Uint8Array(6000).fill(0);
    return emptyAudioData;
}