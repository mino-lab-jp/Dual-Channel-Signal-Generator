// ============================================
// Stereo Tone Generator
// p5.js + Web Audio API
// ============================================


let audioCtx = null;

let oscL = null;
let oscR = null;

let gainL = null;
let gainR = null;

let panL = null;
let panR = null;

let masterGain = null;


// 現在の再生モード
// "stop"
// "both"
// "left"
// "right"

let playMode = "stop";


// DOM

let freqL;
let freqR;

let waveL;
let waveR;

let volumeL;
let volumeR;

let volumeValueL;
let volumeValueR;

let statusText;


// ============================================
// p5 setup
// ============================================

function setup() {

  createCanvas(windowWidth, windowHeight);

  buildUI();

}


// ============================================
// p5 draw
// ============================================

function draw() {

  background(245);

}


// ============================================
// UI作成
// ============================================

function buildUI() {

  const app = document.getElementById("app");


  app.innerHTML = `

    <div class="title">
      Stereo Tone Generator
    </div>

    <div class="subtitle">
      Independent Left / Right Tone Generator
    </div>


    <div class="channels">


      <!-- LEFT -->

      <div class="channel">

        <div class="channelTitle">
          LEFT
        </div>


        <div class="control">

          <label>
            Frequency (Hz)
          </label>

          <input
            id="freqL"
            type="number"
            value="440"
            min="20"
            max="20000"
            step="1"
          >

        </div>


        <div class="control">

          <label>
            Waveform
          </label>

          <select id="waveL">

            <option value="sine">
              Sine
            </option>

            <option value="square">
              Square
            </option>

            <option value="triangle">
              Triangle
            </option>

            <option value="sawtooth">
              Sawtooth
            </option>

          </select>

        </div>


        <div class="control">

          <label>
            Volume
          </label>

          <input
            id="volumeL"
            type="range"
            min="0"
            max="100"
            value="30"
          >

          <div
            id="volumeValueL"
            class="value">
            30 %
          </div>

        </div>

      </div>



      <!-- RIGHT -->

      <div class="channel">

        <div class="channelTitle">
          RIGHT
        </div>


        <div class="control">

          <label>
            Frequency (Hz)
          </label>

          <input
            id="freqR"
            type="number"
            value="440"
            min="20"
            max="20000"
            step="1"
          >

        </div>


        <div class="control">

          <label>
            Waveform
          </label>

          <select id="waveR">

            <option value="sine">
              Sine
            </option>

            <option value="square">
              Square
            </option>

            <option value="triangle">
              Triangle
            </option>

            <option value="sawtooth">
              Sawtooth
            </option>

          </select>

        </div>


        <div class="control">

          <label>
            Volume
          </label>

          <input
            id="volumeR"
            type="range"
            min="0"
            max="100"
            value="30"
          >

          <div
            id="volumeValueR"
            class="value">
            30 %
          </div>

        </div>

      </div>


    </div>



    <!-- Buttons -->

    <div class="buttons">

      <button id="bothButton">
        Both
      </button>

      <button id="leftButton">
        Left Only
      </button>

      <button id="rightButton">
        Right Only
      </button>

      <button id="stopButton">
        Stop
      </button>

    </div>



    <div
      id="statusText"
      class="status">

      STOPPED

    </div>

  `;


  // DOM取得

  freqL =
    document.getElementById("freqL");

  freqR =
    document.getElementById("freqR");


  waveL =
    document.getElementById("waveL");

  waveR =
    document.getElementById("waveR");


  volumeL =
    document.getElementById("volumeL");

  volumeR =
    document.getElementById("volumeR");


  volumeValueL =
    document.getElementById("volumeValueL");

  volumeValueR =
    document.getElementById("volumeValueR");


  statusText =
    document.getElementById("statusText");



  // ==========================================
  // 周波数
  // ==========================================

  freqL.addEventListener(
    "input",
    updateFrequency
  );


  freqR.addEventListener(
    "input",
    updateFrequency
  );



  // ==========================================
  // 波形
  // ==========================================

  waveL.addEventListener(
    "change",
    updateWaveform
  );


  waveR.addEventListener(
    "change",
    updateWaveform
  );



  // ==========================================
  // 音量
  // ==========================================

  volumeL.addEventListener(
    "input",
    function () {

      volumeValueL.textContent =
        volumeL.value + " %";

      updateVolume();

    }
  );


  volumeR.addEventListener(
    "input",
    function () {

      volumeValueR.textContent =
        volumeR.value + " %";

      updateVolume();

    }
  );



  // ==========================================
  // Buttons
  // ==========================================

  document
    .getElementById("bothButton")
    .addEventListener(
      "click",
      function () {

        startAudio("both");

      }
    );


  document
    .getElementById("leftButton")
    .addEventListener(
      "click",
      function () {

        startAudio("left");

      }
    );


  document
    .getElementById("rightButton")
    .addEventListener(
      "click",
      function () {

        startAudio("right");

      }
    );


  document
    .getElementById("stopButton")
    .addEventListener(
      "click",
      function () {

        stopAudio();

      }
    );

}


// ============================================
// AudioContextを初期化
// ============================================

async function initAudio() {

  if (audioCtx) {

    if (audioCtx.state === "suspended") {

      await audioCtx.resume();

    }

    return;

  }


  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;


  audioCtx =
    new AudioContextClass();



  // ==========================================
  // MASTER
  // ==========================================

  masterGain =
    audioCtx.createGain();

  masterGain.gain.value = 0;

  masterGain.connect(
    audioCtx.destination
  );



  // ==========================================
  // LEFT
  // ==========================================

  oscL =
    audioCtx.createOscillator();

  gainL =
    audioCtx.createGain();

  panL =
    audioCtx.createStereoPanner();


  panL.pan.value = -1;


  oscL
    .connect(gainL)
    .connect(panL)
    .connect(masterGain);



  // ==========================================
  // RIGHT
  // ==========================================

  oscR =
    audioCtx.createOscillator();

  gainR =
    audioCtx.createGain();

  panR =
    audioCtx.createStereoPanner();


  panR.pan.value = 1;


  oscR
    .connect(gainR)
    .connect(panR)
    .connect(masterGain);



  // 初期設定

  oscL.frequency.value =
    Number(freqL.value);

  oscR.frequency.value =
    Number(freqR.value);


  oscL.type =
    waveL.value;

  oscR.type =
    waveR.value;


  gainL.gain.value = 0;

  gainR.gain.value = 0;



  // Oscillatorは一度だけ開始
  // 停止時はGainを0にする

  oscL.start();

  oscR.start();


  await audioCtx.resume();

}


// ============================================
// 再生
// ============================================

async function startAudio(mode) {

  await initAudio();


  playMode = mode;


  const now =
    audioCtx.currentTime;


  masterGain.gain.cancelScheduledValues(now);

  masterGain.gain.setTargetAtTime(
    1,
    now,
    0.015
  );


  updateFrequency();

  updateWaveform();

  updateVolume();


  if (mode === "both") {

    statusText.textContent =
      "PLAYING : LEFT + RIGHT";

  }


  if (mode === "left") {

    statusText.textContent =
      "PLAYING : LEFT ONLY";

  }


  if (mode === "right") {

    statusText.textContent =
      "PLAYING : RIGHT ONLY";

  }

}


// ============================================
// 停止
// ============================================

function stopAudio() {

  playMode = "stop";


  if (!audioCtx) {

    statusText.textContent =
      "STOPPED";

    return;

  }


  const now =
    audioCtx.currentTime;


  masterGain.gain.cancelScheduledValues(now);

  masterGain.gain.setTargetAtTime(
    0,
    now,
    0.015
  );


  statusText.textContent =
    "STOPPED";

}


// ============================================
// 周波数変更
// 再生中でも即時反映
// ============================================

function updateFrequency() {

  if (!audioCtx) return;


  let fL =
    Number(freqL.value);

  let fR =
    Number(freqR.value);


  fL =
    constrain(fL, 20, 20000);

  fR =
    constrain(fR, 20, 20000);


  const now =
    audioCtx.currentTime;


  oscL.frequency.cancelScheduledValues(now);

  oscR.frequency.cancelScheduledValues(now);


  oscL.frequency.setTargetAtTime(
    fL,
    now,
    0.01
  );


  oscR.frequency.setTargetAtTime(
    fR,
    now,
    0.01
  );

}


// ============================================
// 波形変更
// ============================================

function updateWaveform() {

  if (!audioCtx) return;


  oscL.type =
    waveL.value;


  oscR.type =
    waveR.value;

}


// ============================================
// 音量変更
// 再生中でも即時反映
// ============================================

function updateVolume() {

  if (!audioCtx) return;


  const leftVolume =
    Number(volumeL.value) / 100;


  const rightVolume =
    Number(volumeR.value) / 100;


  const now =
    audioCtx.currentTime;


  let leftTarget = 0;

  let rightTarget = 0;



  if (playMode === "both") {

    leftTarget =
      leftVolume;

    rightTarget =
      rightVolume;

  }


  if (playMode === "left") {

    leftTarget =
      leftVolume;

    rightTarget =
      0;

  }


  if (playMode === "right") {

    leftTarget =
      0;

    rightTarget =
      rightVolume;

  }


  if (playMode === "stop") {

    leftTarget = 0;

    rightTarget = 0;

  }



  gainL.gain.cancelScheduledValues(now);

  gainR.gain.cancelScheduledValues(now);



  gainL.gain.setTargetAtTime(
    leftTarget,
    now,
    0.01
  );


  gainR.gain.setTargetAtTime(
    rightTarget,
    now,
    0.01
  );

}


// ============================================
// 画面サイズ変更
// ============================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );

}
