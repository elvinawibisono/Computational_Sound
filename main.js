document.addEventListener("DOMContentLoaded", function(event) {

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const visualFeedback = document.getElementById('visual-feedback');
    const circle = document.getElementById('circle');
    
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

    const wave = document.getElementById("waveform");

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    const activeOscillators = {};
    const upGainNodes = {};
    let noteStartTime = 0;
    let animationFrameId = null;
    let circlesize = 0; 
    const maxCircleSize = 100; 
    const circleGrowthRate = 1;
    let keyDownTime = {};
    
    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
        playNote(key);
        keyDownTime[key] = performance.now();

        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            releaseNote(key);
            const noteDuration = (performance.now() - keyDownTime[key]) / 1000; 
            resizeCircle(noteDuration);
        }
    }

    function releaseNote(key){
        console.log("Releasing note:", key);
            const activeOsc = activeOscillators[key];
            const upGainNode = upGainNodes[key];

            const releaseTime = audioCtx.currentTime + 0.1; 

            upGainNode.gain.cancelScheduledValues(audioCtx.currentTime);
            upGainNode.gain.exponentialRampToValueAtTime(0.001, releaseTime);
            upGainNode.gain.setTargetAtTime(0.001, audioCtx.currentTime, 0.01); 
        
            activeOsc.stop(releaseTime+0.1); 
            

            cancelAnimationFrame(animationFrameId);
            resizeCircle(0);
            circle.style.display = 'none';
            updateCircleGradient();

       
            delete activeOscillators[key];
            delete upGainNodes[key];

    }

    function playNote(key) {
        circle.style.display = 'block';
        if (activeOscillators[key]) {
            releaseNote(key);
        }
        

        console.log("Playing note:", key);
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain(); 

        const frequency = keyboardFrequencyMap[key];
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)
        const selectedWave = wave.value;
        console.log(selectedWave)
        osc.type = selectedWave;
        
        gainNode.gain.setValueAtTime(0.001,audioCtx.currentTime);
        osc.connect(gainNode).connect(audioCtx.destination); 

        osc.start();
        activeOscillators[key] = osc;
        upGainNodes[key] = gainNode;

        const lengthGainNode = Object.keys(upGainNodes).length+1;

        Object.keys(upGainNodes).forEach(function(key){
            upGainNodes[key].gain.setTargetAtTime(0.5 / lengthGainNode,audioCtx.currentTime + 0.01,0.2); 
        })
       
        //Attack
        gainNode.gain.exponentialRampToValueAtTime(0.7/ lengthGainNode,audioCtx.currentTime + 0.02); 
        gainNode.gain.setTargetAtTime(0.5/ lengthGainNode,audioCtx.currentTime + 0.01,0.2); 
        
        //Connect       
        const noteColor = getNoteColor(frequency);
        console.log("returncolor:", noteColor);
        //visualFeedback.style.backgroundColor = noteColor;
        circle.style.backgroundColor = noteColor;
        console.log(visualFeedback.style.backgroundColor)
        
        updateCircleGradient();
        resizeCircle(0.1);
        animateCircleSize();

    }

    function resizeCircle(duration) {
        const maxRadius =  maxCircleSize / 2; // Maximum radius for the circle
        const minDuration = 0.1; // Minimum duration to start with a small circle
        const scaleFactor = 100; 

        let newRadius = Math.min(maxRadius, duration * scaleFactor);

        circleSize = newRadius * 2;
        circle.style.width = newRadius + 'px';
        circle.style.height = newRadius + 'px';
    }

    // Function to continuously update the circle size
    function animateCircleSize() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - noteStartTime;
        const maxElapsedTime = 100; // Maximum time for the circle to grow
        const growthPercentage = Math.min(1, elapsedTime / maxElapsedTime);
        const circleSizeTarget = maxCircleSize * growthPercentage;
        circleSize += (circleSizeTarget - circleSize) * 0.1; // Smoothing effect
        circle.style.width = circleSize + 'px';
        circle.style.height = circleSize + 'px';
        animationFrameId = requestAnimationFrame(animateCircleSize);
    }

    function getNoteColor(frequency){ 
        const hue = (frequency % 440)/440;
        console.log("Note frequency:", frequency);
        const saturation = 1.0; 
        const lightness = 0.5; 
        const rgb = hslToRgb(hue,saturation,lightness); 
        const colorString = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        console.log(colorString);
        return colorString; 
        
    }

    function hslToRgb(h,s,l){

        let r ,g ,b; 

        if(s == 0){
            r = g= b = l; 
        } else{
            const hueToRgb = (p,q,t)=>{
                if(t<0) t +=1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hueToRgb(p, q, h + 1 / 3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1 / 3);

        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];

    }

    function updateCircleGradient() {
        const activeColors = Object.keys(activeOscillators).map((key) => {
            const frequency = keyboardFrequencyMap[key];
            return getNoteColor(frequency);
          });
        
          if (activeColors.length > 1) {
            const combinedColor = blendColors(activeColors);
            circle.style.background = `radial-gradient(circle, ${combinedColor}, transparent)`;
          } else if (activeColors.length === 1) {
            // When a single key is played, use the solid color of that key
            circle.style.background = 'none'; // Clear any previous gradient
            circle.style.backgroundColor = activeColors[0];
          } else {
            // No active keys, set transparent background
            circle.style.background = 'none';
          }
    }
    
      function blendColors(colors) {
        const total = [0, 0, 0];
        for (const color of colors) {
          const rgb = color.match(/\d+/g).map(Number);
          total[0] += rgb[0];
          total[1] += rgb[1];
          total[2] += rgb[2];
        }
        const averageColor = total.map((channel) => Math.round(channel / colors.length));
        return `rgb(${averageColor[0]}, ${averageColor[1]}, ${averageColor[2]})`;
      }
  

})