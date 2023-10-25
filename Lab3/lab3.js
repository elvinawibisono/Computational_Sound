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

    function createWindSound() {


        const bufferSize = audioCtx.sampleRate * 5;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize);
        }
        
        // Create the noise source
        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        // Create the crackling sound
        const crackleOscillator = audioCtx.createOscillator();
        crackleOscillator.type = 'sawtooth';
        // crackleOscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
        function triggerCrackling() {
            const randomDuration = 0.02 + Math.random() * 0.03;
            crackleOscillator.frequency.setValueAtTime(1 / randomDuration, audioCtx.currentTime);
    
            const startTime = audioCtx.currentTime;
            noiseSource.start(startTime);
            crackleOscillator.start(startTime);
    
            // Turn off crackling after the duration
            setTimeout(() => {
                noiseSource.stop();
                crackleOscillator.stop();
                // Trigger the next crackling event
                triggerCrackling();
            }, randomDuration * 1000);
        }
    
        
        const crackleGain = audioCtx.createGain();
        crackleGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
        
        // Create the lapping sound
        const lappingOscillator = audioCtx.createOscillator();
        lappingOscillator.type = 'sine';
        lappingOscillator.frequency.setValueAtTime(10, audioCtx.currentTime);
        
        const lappingGain = audioCtx.createGain();
        lappingGain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        
        // Create the hissing sound
        const hissingOscillator = audioCtx.createOscillator();
        hissingOscillator.type = 'sine';
        hissingOscillator.frequency.setValueAtTime(5, audioCtx.currentTime);
        
        const hissingGain = audioCtx.createGain();
        hissingGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        
        // Create the output gain
        const outputGain = audioCtx.createGain();
        outputGain.gain.value = 0.4; // Adjust the gain for the desired overall volume
        
        // Connect audio nodes
        noiseSource.connect(outputGain);
        crackleOscillator.connect(crackleGain);
        lappingOscillator.connect(lappingGain);
        hissingOscillator.connect(hissingGain);
        
        crackleGain.connect(outputGain);
        lappingGain.connect(outputGain);
        hissingGain.connect(outputGain);
        
        outputGain.connect(audioCtx.destination);

        triggerCrackling();
        
        // Start all the sound sources
        noiseSource.start(0);
        crackleOscillator.start(0);
        lappingOscillator.start(0);
        hissingOscillator.start(0);


        // const bufferSize = audioCtx.sampleRate * 5;
        // const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        // const output = noiseBuffer.getChannelData(0);
        
        // let lastOut = 0;
        
        // // Generate fire crackling noise
        // for (let i = 0; i < bufferSize; i++) {
        //     const brown = Math.random() * 2 - 1;
        //     output[i] = (lastOut + (0.02 * brown)) / 1.02;
        //     lastOut = output[i];
        //     output[i] *= 3.5;
        // }
        
        // // Create filters
        // const highpassFilter = audioCtx.createBiquadFilter();
        // highpassFilter.type = 'highpass';
        // highpassFilter.frequency.value = 1000; // Adjust this value for different effects
        
        // const lowpassFilter = audioCtx.createBiquadFilter();
        // lowpassFilter.type = 'lowpass';
        // lowpassFilter.frequency.value = 4000; // Adjust this value for different effects
        
        // // Create an oscillator for added crackle
        // const crackleOscillator = audioCtx.createOscillator();
        // crackleOscillator.type = 'sawtooth';
        // crackleOscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
        
        // const crackleGain = audioCtx.createGain();
        // crackleGain.gain.setValueAtTime(0, audioCtx.currentTime);
        
        // crackleOscillator.connect(crackleGain);
        // crackleGain.connect(audioCtx.destination);
        
        // crackleOscillator.start(0);
        
        // // Create audio nodes
        // const noiseSource = audioCtx.createBufferSource();
        // noiseSource.buffer = noiseBuffer;
        // noiseSource.loop = true;
        // noiseSource.start(0);
        
        // const outputGain = audioCtx.createGain();
        // outputGain.gain.value = 0.3; // Adjust the gain for desired volume
        
        // // Connect the audio nodes
        // noiseSource.connect(lowpassFilter);
        // noiseSource.connect(highpassFilter);
        
        // crackleGain.connect(outputGain);
        
        // highpassFilter.connect(outputGain);
        // lowpassFilter.connect(outputGain);
        
        // outputGain.connect(audioCtx.destination);
        
        // //Add variation in crackling sound with a random interval
        // // const applyCrackleVariation = () => {
        // //     const variation = Math.random() * 0.3 + 0.2; // Adjust the range for more subtle variations
        // //     crackleGain.gain.setValueAtTime(0, audioCtx.currentTime);
        // //     crackleGain.gain.linearRampToValueAtTime(variation, audioCtx.currentTime + 0.02); // Adjust the time for shorter bursts
        // //     const nextVariationTime = 0.02 + Math.random() * 0.05; // Adjust timing as needed
        // //     setTimeout(() => {
        // //         crackleGain.gain.setValueAtTime(variation, audioCtx.currentTime);
        // //         crackleGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.02);
        // //         setTimeout(applyCrackleVariation, nextVariationTime * 1000);
        // //     }, (0.02 + nextVariationTime) * 1000); // Delay the decay of each burst
        // // };
        
        // // applyCrackleVariation();

        return noiseSource; 

      }
    
      let windSoundNode = null;
    
      function playWindSound() {
        if (audioCtx.state === "suspended") {
            audioCtx.resume().then(() => {
                windSoundNode=createWindSound();
                console.log("play");
            });
        } else if (audioCtx.state === "running") {
            windSoundNode= createWindSound();
            console.log("play");
        }
      }
    
      function stopWindSound() {

        if (audioCtx.state === "running") {
            windSoundNode.stop();
            windSoundNode = null;
            console.log("stop");
        }
      }
    
      const playButton3 = document.getElementById("playButton0");
      const stopButton3 = document.getElementById("stopButton0");
    
      playButton3.addEventListener("click", playWindSound);
      stopButton3.addEventListener("click", stopWindSound);

    

    //create Running Water 

    function createBilinearExponentialRandom() {
        const randInt = Math.random() * 8192;
        const isPositive = randInt > 4096 ? 1 : -1;
        return (isPositive * (Math.pow((randInt / 8192), 2) * 9) / 23000);
    }
    
    // Function to create running water sound
    function createRunningWaterSound() {
        const bufferSize = audioCtx.sampleRate * 5; 
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
    
        const baseFrequency = 600; 
        const density = 200; 
        const slewRate = 2.69; 
    
        let lastFrequency = baseFrequency;
        for (let i = 0; i < bufferSize; i++) {
            const frequencyChange = createBilinearExponentialRandom() * density;
            lastFrequency += (frequencyChange * slewRate);
            output[i] = Math.sin(2 * Math.PI * lastFrequency * (i / audioCtx.sampleRate));
        }

        const runningWater = audioCtx.createBufferSource();
        runningWater.buffer = noiseBuffer;
        runningWater.loop = true;
        runningWater.connect(audioCtx.destination);
        runningWater.start(0);
   
        return runningWater;
    }

    let runningWaterNode = null;

    
    // Function to start playing the sound
    function playRunningWater() {
        if (audioCtx.state === "suspended") {
            audioCtx.resume().then(() => {
                runningWaterNode = createRunningWaterSound();
                console.log("play water");
            });
        } else if (audioCtx.state === "running") {
            runningWaterNode = createRunningWaterSound();
            console.log("play water");
        }
    }
    
    // Function to stop the sound (optional)
    function stopRunningWater() {
        if (audioCtx.state === "running") {
            runningWaterNode.stop();
            runningWaterNode = null;
            console.log("stop water");
        }
    }


    const playButton2 = document.getElementById('playButton1');
    const stopButton2 = document.getElementById('stopButton2');
    playButton2.addEventListener('click', playRunningWater);
    stopButton2.addEventListener('click', stopRunningWater);


}); 
