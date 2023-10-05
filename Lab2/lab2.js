var modFreqVal = 100;
var lfoFreqVal = 0;
var modIndexVal = 100;

document.addEventListener("DOMContentLoaded", function(event) {

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var partialNums = document.getElementById("partials"); 
    var lfoFreqInput = document.getElementById("LFOFrequency"); 
    const synthesisType = document.getElementById('synthesis');
    var modFreq = document.getElementById('modulationFrequency'); 
    var modIndex = document.getElementById('modulationIndex'); 
    var activeBase = {}; 
    var activebases = {};
    var baseGains = {};
    let activeAMSynthesis = {}; 
    let activeFMSynthesis = {};
    let activeAdditive = {}; 

    function updateModFreq(val) {
        modFreqVal = val
    };

    function updateIndex(val) {
        modIndexVal = val
    };

    function updateLFO(val){
        lfoFreqVal = val;
    };

    const keyboardFrequencyMap = {
        '90': 261.625565300598634,  //Z - C
        '83': 277.182630976872096, //S - C#
        '88': 293.664767917407560,  //X - D
        '68': 311.126983722080910, //D - D#
        '67': 329.627556912869929,  //C - E
        '86': 349.228231433003884,  //V - F
        '71': 369.994422711634398, //G - F#
        '66': 391.995435981749294,  //B - G
        '72': 415.304697579945138, //H - G#a
        '78': 440.000000000000000,  //N - A
        '74': 466.163761518089916, //J - A#
        '77': 493.883301256124111,  //M - B
        '81': 523.251130601197269,  //Q - C
        '50': 554.365261953744192, //2 - C#
        '87': 587.329535834815120,  //W - D
        '51': 622.253967444161821, //3 - D#
        '69': 659.255113825739859,  //E - E
        '82': 698.456462866007768,  //R - F
        '53': 739.988845423268797, //5 - F#
        '84': 783.990871963498588,  //T - G
        '54': 830.609395159890277, //6 - G#
        '89': 880.000000000000000,  //Y - A
        '55': 932.327523036179832, //7 - A#
        '85': 987.766602512248223,  //U - B
    }

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    
    var compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);

    const activeOscillators = {};
    const activeGainNode = {};

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            playNote(key);
        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            releaseNote(key);
            console.log("keyup"); 
         
        }
    }

    //old code 
    function releaseNote(key){


        console.log("Releasing note:", key);
        // const activeOsc = activeOscillators[key];
        // const activeGainNodes = activeGainNode[key];

        const releaseTime = audioCtx.currentTime + 0.1; 

        activeGainNode[key].forEach(function(element) {
            element.gain.cancelScheduledValues(audioCtx.currentTime);
            element.gain.setValueAtTime(element.gain.value, audioCtx.currentTime); // Set the current gain value
            // element.gain.linearRampToValueAtTime(0.00001, audioCtx.currentTime + 0.05); // Release 
            element.gain.exponentialRampToValueAtTime(0.001, releaseTime); 
            // element.gain.setTargetAtTime(0.001,audioCtx.currentTime,0.01);
        }); 

        setTimeout(function(){
            activeGainNode[key].forEach(function(element) {
                element.gain.setValueAtTime(0, audioCtx.currentTime);
            });
        
            activeOscillators[key].forEach(function(element) {
                element.stop(releaseTime);
            });

            delete activeGainNode[key];
            delete activeOscillators[key];
        }, 100);

        

    }

    function playAdditive(key, numPartials, lfoFreq){
       
        console.log("NumPartials", numPartials); 

        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.25; 
    
        const base = audioCtx.createOscillator();
        base.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime);

       
    
        const oscillators = [base];
        for (let i = 0; i <= numPartials; i++) {
          const osc = audioCtx.createOscillator();
          const freq =
            (i + 2) * keyboardFrequencyMap[key] + (-1) ** i * Math.random() * 15;
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          osc.connect(gainNode);
          osc.start();
          oscillators.push(osc);
        }
        activeOscillators[key] = oscillators
        activeGainNode[key] = [gainNode]

        console.log("lfoFreq", lfoFreq); 

        if (lfoFreq > 0) {
            const lfo = audioCtx.createOscillator();
            lfo.frequency.setValueAtTime(lfoFreq, audioCtx.currentTime);
            const lfoGain = audioCtx.createGain();
            lfoGain.gain.value = 10; 
            lfo.connect(lfoGain); 
            lfo.connect(base.frequency);
            lfo.start();
            activeOscillators[key].push(lfo);
  
        }
    
        base.connect(gainNode); 
        gainNode.connect(audioCtx.destination);
        base.start();
        
        Object.keys(activeGainNode).forEach((key) => {
            for (var i = 0; i < activeGainNode[key].length; i++) {
                activeGainNode[key][i].gain.setTargetAtTime(0.7 / (Object.keys(activeGainNode).length + (oscillators.length * Object.keys(activeGainNode).length)), audioCtx.currentTime, 0.2)
            }
        })
    
    }


    function playAM(key,modFreqVal, lfoFreq){

        console.log(modFreqVal); 

        var carrier = audioCtx.createOscillator();
        var modulatorFreq = audioCtx.createOscillator();
        modulatorFreq.frequency.setValueAtTime(modFreqVal, audioCtx.currentTime);
        carrier.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime); 

        const modulated = audioCtx.createGain();
        const depth = audioCtx.createGain();
        depth.gain.value = 0.5 
        modulated.gain.value = 1.0 - depth.gain.value

        modulatorFreq.connect(depth).connect(modulated.gain); 
        carrier.connect(modulated);
        modulated.connect(audioCtx.destination);

        carrier.start();
        modulatorFreq.start();
        activeOscillators[key]=[modulatorFreq];
        activeOscillators[key]=[carrier];
        
        activeGainNode[key]=[modulated,depth];

        if (lfoFreq > 0) {
            const lfo = audioCtx.createOscillator();
            lfo.frequency.setValueAtTime(lfoFreq, audioCtx.currentTime);
            const lfoGain = audioCtx.createGain();
            lfoGain.gain.value = 10; 
            lfo.connect(lfoGain); 
            lfo.connect(modulatorFreq.frequency);
            lfo.start();
            activeOscillators[key].push(lfo);
  
        }

        Object.keys(activeGainNode).forEach((key) => {
            for (var i = 0; i < activeGainNode[key].length; i++) {
                activeGainNode[key][i].gain.setTargetAtTime(0.7 / (Object.keys(activeGainNode).length + (2 * Object.keys(activeGainNode).length)), audioCtx.currentTime, 0.2)
            }
        })
    
    }

    function playFM(key, modIndexVal, modFreqVal, lfoFreq){
        console.log(modIndexVal); 
        console.log(modFreqVal); 
        console.log(lfoFreq);

        var carrier = audioCtx.createOscillator();
        var modulatorFreq = audioCtx.createOscillator();
        carrier.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime); 
    
        var modulationIndex = audioCtx.createGain();
        var gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.7, audioCtx.currentTime)
       
        modulationIndex.gain.value = modIndexVal;
        modulatorFreq.frequency.value = modFreqVal;
    
        modulatorFreq.connect(modulationIndex);
        modulationIndex.connect(carrier.frequency)
        
        carrier.connect(gainNode).connect(compressor).connect(audioCtx.destination);

        carrier.start();
        modulatorFreq.start();

        if (lfoFreq > 0) {
           
            const lfo = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            lfo.frequency.value = lfoFreq; 
            lfoGain.gain.value = 8; 
            lfo.connect(lfoGain).connect(modulatorFreq.frequency);
            lfo.start();
         
            activeOscillators[key] = [carrier, modulatorFreq, lfo];
            activeGainNode[key] = [modulationIndex, gainNode, lfoGain];

           
        } else{

            activeOscillators[key] = [carrier, modulatorFreq];
            activeGainNode[key] = [modulationIndex, gainNode];

        }

    
        Object.keys(activeGainNode).forEach((key) => {
            for (var i = 0; i < activeGainNode[key].length; i++) {
                activeGainNode[key][i].gain.setTargetAtTime(0.7/ (Object.keys(activeGainNode).length + (2 * Object.keys(activeGainNode).length)), audioCtx.currentTime, 0.2)
            }
        })
 

    }

    function playNote(key){
        var selectedSynthesisType = synthesisType.value; 

        console.log("synth: ", selectedSynthesisType); 


       
        if (activeOscillators[key]) {
            releaseNote(key);
            
        }

        if(selectedSynthesisType == "additive"){ 
            const numPartials = partialNums.value;
            const lfoFreq = parseFloat(lfoFreqInput.value) || 0.5;
            playAdditive(key, numPartials, lfoFreq); 

            
        }

        else if (selectedSynthesisType == "AM"){
            const modFreqVal = parseFloat(modFreq.value) || 0.5;
            const lfoFreq = parseFloat(lfoFreqInput.value) || 0.5;
            playAM(key, modFreqVal,lfoFreq); 
        }

        else if(selectedSynthesisType == "FM"){
            const modFreqVal = parseFloat(modFreq.value) || 0.5;
            const lfoFreq = parseFloat(lfoFreqInput.value) || 0.5;
            const modIndexVal = parseFloat(modIndex.value) || 0.5;
            playFM(key, modIndexVal, modFreqVal, lfoFreq); 


        }




    }

    



})