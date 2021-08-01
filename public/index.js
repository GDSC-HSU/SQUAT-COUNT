var video = document.getElementById("livestream");
var startutton = document.getElementById("startutton");
var repCounter = document.getElementById("repCounter");
let modelURL = "model.json";
let modelMetaData = "metadata.json";
var model;
var URL = "https://teachablemachine.withgoogle.com/models/nsk5LV9AF/"


class SquatCounter {
    squatCount = 0;
    currentState;
    prevState;
    threshHold = 40;
    constructor() {
        repCounter.innerHTML = this.squatCount;
    }

    _setState(squat_state_name) {
        this.prevState = this.currentState;

        this.currentState = squat_state_name;

        // UP->DOWN->UP => count++
        if (this.prevState != this.currentState && squat_state_name == "squat_up") {
            this.squatCount++;
            repCounter.innerHTML = this.squatCount;
        }

    }

    // Input as follow
    // prediction = {// className: "squat_down"
    // probability: 0.9775500297546387}
    processState(prediction) {
        // sort the max squatState probability
        var squat_sate = prediction.sort((a, b) => a.probability - b.probability)[0];
        var state_name = squat_sate.className
        this._setState(state_name);
    }
}


function enableWebCam() {
    return navigator.mediaDevices.getUserMedia({
        video: true
    }).then(mediaStream => {
        video.srcObject = mediaStream;

    })
}



async function loadModel() {
    model = await tmPose.load(URL + modelURL, URL + modelMetaData);




}
var startState = false;
var intervalLoopId;


function startSquat() {
    var squadCounter = new SquatCounter()

    return setInterval(async () => {
        var prediction = await predict();
        squadCounter.processState(prediction)
    }, 20)
}


async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(video);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);
    return prediction;
}

function main(params) {
    // loadModel()
    enableWebCam().then(async () => {

        startutton.disabled = true
        startutton.innerText = "LOADING...."
        await loadModel();
        startutton.innerText = "START"

        startutton.disabled = false;

        startutton.addEventListener("click", () => {
            if (!startState) {
                intervalLoopId = startSquat();
                startState = true;
            } else {
                clearInterval(intervalLoopId);
                startState = false;
                repCounter.innerHTML = ""
            }
        });
    })
}

main();