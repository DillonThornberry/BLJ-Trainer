console.log('working')

const connectMsg = document.getElementById('connect-msg')
const currentlyPressedText = document.getElementById('pressed-button')
const mashButtonSelect = document.getElementById('mash-button')
const startButtonSelect = document.getElementById('start-button')




var gamePadIndex = 0
var startButtonActivate = {active: false, timestamp: null}
const startButtonTimeout = 300

var aPressTimes = []

window.addEventListener("gamepadconnected", (e) => {
    console.log("Connected:", e.gamepad.id);
    if (e.gamepad.id == 'vJoy - Virtual Joystick (Vendor: 1234 Product: bead)'){
        return
    }
    gamePadIndex = navigator.getGamepads().findIndex(gp => gp.id = e.gamepad.id)
    connectMsg.innerHTML = `Gamepad connected: ${e.gamepad.id}`
    console.log(navigator.getGamepads()[gamePadIndex])
    const gamepad = navigator.getGamepads()[gamePadIndex];
    const buttons = gamepad.buttons.map(b => b.value)

    buttons.forEach((button, i) => {
        mashButtonSelect.add(new Option(`button ${i}`, i))
        startButtonSelect.add(new Option(`button ${i}`, i))
    })

    mashButtonSelect.value = 1
    startButtonSelect.value = 9

});

window.addEventListener("gamepaddisconnected", (e) => {
    console.log("Disconnected:", e.gamepad.id);
    connectMsg.innerHTML = 'Gamepad disconnected'
});

var aPressed = false
function readGamepad(timestamp) {
    const gamepad = navigator.getGamepads()[gamePadIndex];

    if (gamepad) {
        const buttons = gamepad.buttons.map(b => b.value)

        var pressedCount = 0
        for (var i = 0; i < buttons.length; i++){
            pressedCount += buttons[i]

            if (buttons[i]){
                currentlyPressedText.innerHTML = `button ${i}`
            }
        }

        if (!pressedCount){
            currentlyPressedText.innerHTML = ''
        }

        var startButtonPressed = buttons[startButtonSelect.value]
        var mashButtonPressed = buttons[mashButtonSelect.value]

        if (startButtonPressed){
            if (startButtonActivate.timestamp == null || timestamp - startButtonActivate.timestamp > 300 ){
                startButtonActivate.active = !startButtonActivate.active
                startButtonActivate.timestamp = timestamp

                if (startButtonActivate.active){
                    start()
                }
                else {
                    stop()
                }
                //console.log(startButtonActivate.active)
            }
        }

        if (mashButtonPressed){
            if (!aPressed){
                aPressTimes.push(timestamp)
                aPressed = true

            }
        }

        else {
            if(aPressed){
                aPressed = false
            }
        }
    }

    requestAnimationFrame(readGamepad);
}

requestAnimationFrame(readGamepad);

function stdDev(numbers) {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;

    const variance = numbers.reduce(
        (sum, n) => sum + (n - mean) ** 2, 0
    ) / numbers.length;

    return Math.sqrt(variance);
}

const averageText = document.getElementById('average')
const stdText = document.getElementById('std')
const missText = document.getElementById('miss-count')

const missAmount = 20

function calculateTimes() {
    const desiredInterval = 1 / (Number(document.getElementById('mash-speed').value)) * 60000
    //console.log(desiredInterval)
    var sum = 0
    var counted = 0
    var diffs = []
    var missCount = 0

    for (var i = aPressTimes.length-1; i > 0; i--){
        var diff = aPressTimes[i] - aPressTimes[i-1]
        if (diff > 1000){
            //console.log(counted)
            break
        }
        diffs.push(diff)
        if (Math.abs(desiredInterval - diff) > missAmount){
            missCount++
        }
        counted++
        sum += diff
    }

    if (diffs.length == 0){
        requestAnimationFrame(calculateTimes)
        return
    }

    avg = sum / counted
    bpm = (1 / avg) * 60000
    const std_dev = stdDev(diffs)

    averageText.innerHTML = `${bpm.toFixed(2)}`
    stdText.innerHTML = `${std_dev.toFixed(2)}`
    missText.innerHTML = `${missCount} / ${counted}    (${Math.floor((missCount / counted * 100))}% Missed)`

    requestAnimationFrame(calculateTimes)
}

requestAnimationFrame(calculateTimes)

var startButtonPressed = false
var AButtonPressed = false

// const button = document.getElementById("toneButton");
let timer = null;

const audio = new AudioContext();

function playTone() {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const volumeSlider = document.getElementById("volume");

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200, audio.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
        500, audio.currentTime + 0.035
    );

    gain.gain.setValueAtTime(Number(volumeSlider.value) / 100, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        0.001, audio.currentTime + 0.04
    );

    osc.connect(gain);
    gain.connect(audio.destination);

    osc.start();
    osc.stop(audio.currentTime + 0.045);
}

function start() {
    if (timer !== null) return;
    const interval = 1 / (Number(document.getElementById('mash-speed').value)) * 60000
    audio.resume();
    playTone();
    timer = setInterval(playTone, interval);
}

function stop() {
    clearInterval(timer);
    timer = null;
}

// button.addEventListener("pointerdown", start);
// button.addEventListener("pointerup", stop);
// button.addEventListener("pointerleave", stop);
// button.addEventListener("pointercancel", stop);
