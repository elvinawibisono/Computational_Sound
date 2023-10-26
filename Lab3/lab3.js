document.addEventListener("DOMContentLoaded", function(event) {

    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let brownNoiseNodes = null;
    

    // me and luci feinberg x
    function createBubbling(){
            
        // Create a brown noise buffer
        const bufferSize = audioCtx.sampleRate * 5; // Adjust the duration as needed
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const brown = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * brown)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }

        const rhpf = audioCtx.createBiquadFilter();

        const brownNoise = audioCtx.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;
        brownNoise.start(0);

        const lpf1 = audioCtx.createBiquadFilter();
        lpf1.type = 'lowpass';
        lpf1.frequency.value = 400;
        // lpf1.Q.value = 0.1; 
        
        const lpf2 = audioCtx.createBiquadFilter();
        lpf2.type = 'lowpass';
        lpf2.frequency.value = 14;
        // lpf2.Q.value = 0.1;
        const helper = new ConstantSourceNode(audioCtx, {offset: 150})
        // helper.connect(lpf2)
        // helper.connect(lpf1.frequency)
        // helper.connect(rhpf);
        helper.connect(rhpf.frequency)
        helper.start();
        
        
        rhpf.type = 'highpass';
        // rhpf.Q.value = 1 / 0.03;
        rhpf.Q.value =  1/0.03; //1/0.03
        rhpf.gain.value = 0.1

        const outputGain = audioCtx.createGain();
        outputGain.gain.value = 0.2;

        const freqGain = audioCtx.createGain(); 
        freqGain.gain.value = 1200; 


        brownNoise.connect(lpf1).connect(rhpf);
        brownNoise.connect(lpf2).connect(freqGain);
        freqGain.connect(rhpf.frequency);
        rhpf.connect(outputGain).connect(audioCtx.destination);
    

        return brownNoise; 

    }

    // let brownNoiseNodes = null; 

    // console.log(brownNoiseNodes.state)
    
    function playAudio() {
        if (audioCtx.state === "suspended") {
            audioCtx.resume().then(() => {
                brownNoiseNodes=createBubbling();
                console.log("play");
            });
        } else if (audioCtx.state === "running") {
            brownNoiseNodes= createBubbling();
            console.log("play");
        }
    }

    // Function to stop the audio
    function stopAudio() {
        if (audioCtx.state === "running") {
            brownNoiseNodes.stop();
            brownNoiseNodes = null;
            console.log("stop");
        }
    }

    const playButton = document.getElementById('playButton');
    const stopButton = document.getElementById('stopButton');

    playButton.addEventListener('click', playAudio);
    stopButton.addEventListener('click', stopAudio);


   


    // {RHPF.ar(LPF.ar(BrownNoise.ar(), 400), LPF.ar(BrownNoise.ar(), 14) * 400 + 500, 0.03, 0.1)}.play
    var audioCtx1= new (window.AudioContext || window.webkitAudioContext)();

    function createFireCrack() {
        const duration = 0.05;
        const sampleRate = audioCtx1.sampleRate;
        const numFrames = duration * sampleRate;
        const buffer = audioCtx1.createBuffer(1, numFrames, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < numFrames; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / numFrames * 10);
        }
        const gainNode = audioCtx1.createGain();
        gainNode.gain.setValueAtTime(Math.random() * 0.5, audioCtx1.currentTime);
    
        const bufferSource = audioCtx1.createBufferSource();
        bufferSource.buffer = buffer;
    
        bufferSource.connect(gainNode);
        gainNode.connect(audioCtx1.destination);
    
        bufferSource.start();
        bufferSource.stop(audioCtx1.currentTime + 1);
    }

  
    let cracklingInterval = null;
    // let cracklingInterval2 = null; 

    function createFireSound() {

        var bufferSize = 10 * audioCtx1.sampleRate;
        var noiseBuffer = audioCtx1.createBuffer(1, bufferSize, audioCtx1.sampleRate);
        var output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * 0.5;
        }
        
        var sourceNoise = audioCtx1.createBufferSource();
        sourceNoise.buffer = noiseBuffer;
        sourceNoise.loop = true;
        
        // Create white noise 2 buffer and source
        var noiseBuffer2 = audioCtx1.createBuffer(1, bufferSize, audioCtx1.sampleRate);
        var output2 = noiseBuffer2.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output2[i] = (Math.random() * 2 - 1) * 0.5;
        }


        var sourceNoise2 = audioCtx1.createBufferSource();
        sourceNoise2.buffer = noiseBuffer2;
        sourceNoise2.loop = true;
       
        var gainNode = audioCtx1.createGain();
        var hissingNode = audioCtx1.createGain();
        var hissingNode2 = audioCtx1.createGain();
        hissingNode2.gain.value = 0.0025;
    
        var crackleOsc2 = audioCtx1.createOscillator();
        crackleOsc2.type = "sine";
        crackleOsc2.frequency.value = 0.5;
        var crackleOsc1 = audioCtx1.createOscillator();
        crackleOsc1.type = "triangle";
        crackleOsc1.frequency.value = 0.7;
        
        var filter1 = audioCtx1.createBiquadFilter();
        filter1.type = 'lowpass';
        filter1.frequency.value = 0.9;
        var filter2 = audioCtx1.createBiquadFilter();
        filter2.type = 'highpass';
        filter2.frequency.value = 1500;

        const lappingSound = audioCtx1.createBiquadFilter();
        lappingSound.type = "bandpass";
        lappingSound.frequency.value = 50;
        lappingSound.Q.value = 15;
    
        const lappingSound2 = audioCtx1.createBiquadFilter();
        lappingSound2.type = 'highpass';
        lappingSound2.frequency.value = 40;
    
        const flameSound = audioCtx1.createWaveShaper();
        var distortion = new Float32Array(2);
        distortion[0] = -0.5;
        distortion[1] = 0.5;
        flameSound.curve = distortion;
    
        const flameSound2 = audioCtx1.createBiquadFilter();
        flameSound2.type = 'highpass';
        flameSound2.frequency.value = 10;
    
        const flameNode = audioCtx1.createGain();
        flameNode.gain.value = 100;


        console.log("crack: ", cracklingInterval); 
        cracklingInterval = null; 
    

        function triggerRandomCracklingSound(){

           
            const randomInterval = Math.random() * 1000 + 500; // Random interval between 500ms and 5500ms
            createFireCrack(); // Call your createFireCrack function
            gainNode.gain.setValueAtTime(Math.random() * 0.08, audioCtx1.currentTime);
            console.log(gainNode.gain.value)
 
            cracklingInterval = setTimeout(triggerRandomCracklingSound, randomInterval);
        }

        // cracklingInterval2 = null; 

        // function triggerRandomCracklingSound2(){

        //     const randomInterval = Math.random() * 5000 + 500; // Random interval between 500ms and 5500ms
        //     createFireCrack(); 
        //     gainNode.gain.setValueAtTime(Math.random() * 0.025, audioCtx1.currentTime);
       
        //     cracklingInterval2 = setTimeout(triggerRandomCracklingSound, randomInterval);
        // }

        triggerRandomCracklingSound();
        // triggerRandomCracklingSound2();

        // console.log("crack2: ", cracklingInterval); 

        sourceNoise.start(0);
        sourceNoise2.start(0);
        crackleOsc1.start();
        crackleOsc2.start();

        sourceNoise.connect(lappingSound)
        .connect(lappingSound2)
        .connect(flameSound)
        .connect(flameSound2)
        .connect(flameNode)
        .connect(audioCtx1.destination);

        sourceNoise.connect(filter2)
        filter2.connect(hissingNode);
        sourceNoise2.connect(filter1)
        filter1.connect(hissingNode);
        crackleOsc2.connect(gainNode);
        crackleOsc1.connect(gainNode.gain);
        gainNode.connect(hissingNode.gain);
        hissingNode.connect(hissingNode2).connect(audioCtx1.destination);

        return {sourceNoise, sourceNoise2, crackleOsc1, crackleOsc2}; 

    }
    
    let fireSoundNodes = null; 

    function playFireSound() {
        if (audioCtx1.state === "suspended") {
            audioCtx1.resume().then(() => {
                fireSoundNodes = createFireSound();
                console.log("play");
            });
        } else if (audioCtx1.state === "running" && fireSoundNodes === null) {
            fireSoundNodes = createFireSound();
            console.log("play");
        }
    }
 
  
    function stopFireSound() {
        if (audioCtx1.state === "running" && fireSoundNodes) {

            console.log ("crack2: ", cracklingInterval)

            clearInterval(cracklingInterval);
            // clearInterval(cracklingInterval2); 
            // Stop the audio nodes
            fireSoundNodes.sourceNoise.stop();
            fireSoundNodes.sourceNoise2.stop();
            fireSoundNodes.crackleOsc1.stop();
            fireSoundNodes.crackleOsc2.stop();
    
            // Disconnect your nodes if necessary
            fireSoundNodes.sourceNoise.disconnect();
            fireSoundNodes.sourceNoise2.disconnect();
            fireSoundNodes.crackleOsc1.disconnect();
            fireSoundNodes.crackleOsc2.disconnect();

            cracklingInterval = null;
            // cracklingInterval2 = null;  
    
            fireSoundNodes = null;
            console.log("stop");
        }
    }
    
    // function stopFireSound()  {
    //     if (audioCtx1.state === "running") {
    //         // stopFireSound(fireSoundNodes);
    //         fireSoundNodes.stop();
    //         fireSoundNodes = null;
    //         console.log("stop");
    //     }
    // }
    
    
    
    const playButton3 = document.getElementById("playButton0");
    const stopButton3 = document.getElementById("stopButton0");

    playButton3.addEventListener("click", playFireSound);
    stopButton3.addEventListener("click", stopFireSound);

       

}); 



    


        
