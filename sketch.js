// ======================================================
// Dual Channel Signal Generator
// p5.js + Web Audio API
// LEFT / RIGHT independent control
// ======================================================


// ------------------------------
// Audio
// ------------------------------

let audioCtx = null;

let oscL = null;
let oscR = null;

let gainL = null;
let gainR = null;

let merger = null;
let masterGain = null;


// 再生状態
// stop / both / left / right

let playMode = "stop";


// ------------------------------
// DOM
// ------------------------------

let freqInputL;
let freqInputR;

let freqSliderL;
let freqSliderR;

let freqDisplayL;
let freqDisplayR;

let waveL;
let waveR;

let volumeL;
let volumeR;

let volumeDisplayL;
let volumeDisplayR;

let statusText;


// ======================================================
// p5 setup
// ======================================================

function setup() {

  createCanvas(windowWidth, windowHeight);

  buildUI();

}


// ======================================================
// p5 draw
// ======================================================

function draw() {

  background(245);

}


// ======================================================
// UI
// ======================================================

function buildUI() {

  const app =
    document.getElementById("app");


  app.innerHTML = `

    <div class="title">
      Dual Channel Signal Generator
    </div>

    <div class="subtitle">
      Independent Left / Right Audio Output
    </div>


    <div class="channels">


      <!-- ======================================
           LEFT
      ======================================= -->

      <div class="channel">

        <div class="channelTitle">
          LEFT
        </div>


        <div class="control">

          <label>
            Frequency (Hz)
          </label>

          <input
            id="freqInputL"
            type="number"
            value="440"
            min="20"
            max="20000"
            step="1"
          >

          <input
            id="freqSliderL"
            type="range"
            min="0"
            max="1000"
            value="447"
            step="1"
          >

          <div
            id="freqDisplayL"
            class="frequencyDisplay">
            440 Hz
          </div>

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
            step="1"
          >

          <div
            id="volumeDisplayL"
            class="volumeDisplay">
            30 %
          </div>

        </div>

      </div>



      <!-- ======================================
           RIGHT
      ======================================= -->

      <div class="channel">

        <div class="channelTitle">
          RIGHT
        </div>


        <div class="control">

          <label>
            Frequency (Hz)
          </label>

          <input
            id="freqInputR"
            type="number"
            value="440"
            min="20"
            max="20000"
            step="1"
          >

          <input
            id="freqSliderR"
            type="range"
            min="0"
            max="1000"
            value="447"
            step="1"
          >

          <div
            id="freqDisplayR"
            class="frequencyDisplay">
            440 Hz
          </div>

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
            step="1"
          >

          <div
            id="volumeDisplayR"
            class="volumeDisplay">
            30 %
          </div>

        </div>

      </div>

    </div>



    <!-- ======================================
         Buttons
    ======================================= -->

    <div class="buttons">

      <button id="bothButton">
        Both
      </button>

      <button id="leftButton">
        Left
      </button>

      <button id="rightButton">
        Right
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



  // ==================================================
  // DOM取得
  // ==================================================

  freqInputL =
    document.getElementById("freqInputL");

  freqInputR =
    document.getElementById("freqInputR");


  freqSliderL =
    document.getElementById("freqSliderL");

  freqSliderR =
    document.getElementById("freqSliderR");


  freqDisplayL =
    document.getElementById("freqDisplayL");

  freqDisplayR =
    document.getElementById("freqDisplayR");


  waveL =
    document.getElementById("waveL");

  waveR =
    document.getElementById("waveR");


  volumeL =
    document.getElementById("volumeL");

  volumeR =
    document.getElementById("volumeR");


  volumeDisplayL =
    document.getElementById("volumeDisplayL");

  volumeDisplayR =
    document.getElementById("volumeDisplayR");


  statusText =
    document.getElementById("statusText");



  // ==================================================
  // 最初に440Hzに対応する位置へ
  // ==================================================

  freqSliderL.value =
    frequencyToSlider(440);

  freqSliderR.value =
    frequencyToSlider(440);



  // ==================================================
  // LEFT 周波数：数値入力
  // ==================================================

  freqInputL.addEventListener(
    "input",
    function () {

      let f =
        Number(freqInputL.value);

      if (!Number.isFinite(f)) return;

      f =
        clampFrequency(f);


      freqSliderL.value =
        frequencyToSlider(f);


      freqDisplayL.textContent =
        Math.round(f) + " Hz";


      updateFrequency();

    }
  );



  // ==================================================
  // RIGHT 周波数：数値入力
  // ==================================================

  freqInputR.addEventListener(
    "input",
    function () {

      let f =
        Number(freqInputR.value);

      if (!Number.isFinite(f)) return;


      f =
        clampFrequency(f);


      freqSliderR.value =
        frequencyToSlider(f);


      freqDisplayR.textContent =
        Math.round(f) + " Hz";


      updateFrequency();

    }
  );



  // ==================================================
  // LEFT 周波数：スライダー
  // ==================================================

  freqSliderL.addEventListener(
    "input",
    function () {

      const f =
        sliderToFrequency(
          Number(freqSliderL.value)
        );


      freqInputL.value =
        Math.round(f);


      freqDisplayL.textContent =
        Math.round(f) + " Hz";


      updateFrequency();

    }
  );



  // ==================================================
  // RIGHT 周波数：スライダー
  // ==================================================

  freqSliderR.addEventListener(
    "input",
    function () {

      const f =
        sliderToFrequency(
          Number(freqSliderR.value)
        );


      freqInputR.value =
        Math.round(f);


      freqDisplayR.textContent =
        Math.round(f) + " Hz";


      updateFrequency();

    }
  );



  // ==================================================
  // 波形
  // ==================================================

  waveL.addEventListener(
    "change",
    updateWaveform
  );


  waveR.addEventListener(
    "change",
    updateWaveform
  );



  // ==================================================
  // 音量
  // ==================================================

  volumeL.addEventListener(
    "input",
    function () {

      volumeDisplayL.textContent =
        volumeL.value + " %";

      updateVolume();

    }
  );


  volumeR.addEventListener(
    "input",
    function () {

      volumeDisplayR.textContent =
        volumeR.value + " %";

      updateVolume();

    }
  );



  // ==================================================
  // Buttons
  // ==================================================

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



// ======================================================
// Audio 初期化
// ======================================================

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



  // ==================================================
  // Oscillator
  // ==================================================

  oscL =
    audioCtx.createOscillator();

  oscR =
    audioCtx.createOscillator();



  // ==================================================
  // Gain
  // ==================================================

  gainL =
    audioCtx.createGain();

  gainR =
    audioCtx.createGain();


  gainL.gain.value = 0;

  gainR.gain.value = 0;



  // ==================================================
  // Channel Merger
  //
  // Input 0 → LEFT
  // Input 1 → RIGHT
  // ==================================================

  merger =
    audioCtx.createChannelMerger(2);


  masterGain =
    audioCtx.createGain();


  masterGain.gain.value = 1;



  // LEFT

  oscL.connect(gainL);

  gainL.connect(
    merger,
    0,
    0
  );


  // RIGHT

  oscR.connect(gainR);

  gainR.connect(
    merger,
    0,
    1
  );


  merger
    .connect(masterGain)
    .connect(audioCtx.destination);



  // ==================================================
  // 初期周波数
  // ==================================================

  oscL.frequency.value =
    Number(freqInputL.value);


  oscR.frequency.value =
    Number(freqInputR.value);



  // ==================================================
  // 初期波形
  // ==================================================

  oscL.type =
    waveL.value;


  oscR.type =
    waveR.value;



  // Oscillatorは一度だけstart

  oscL.start();

  oscR.start();


  await audioCtx.resume();

}



// ======================================================
// 再生
// ======================================================

async function startAudio(mode) {

  await initAudio();


  playMode = mode;


  updateFrequency();

  updateWaveform();

  updateVolume();



  if (mode === "both") {

    statusText.textContent =
      "PLAYING : LEFT + RIGHT";

  }


  else if (mode === "left") {

    statusText.textContent =
      "PLAYING : LEFT ONLY";

  }


  else if (mode === "right") {

    statusText.textContent =
      "PLAYING : RIGHT ONLY";

  }

}



// ======================================================
// STOP
// ======================================================

function stopAudio() {

  playMode =
    "stop";


  updateVolume();


  statusText.textContent =
    "STOPPED";

}



// ======================================================
// 周波数更新
// 再生中でも即時変更
// ======================================================

function updateFrequency() {

  if (!audioCtx) return;


  let fL =
    Number(freqInputL.value);


  let fR =
    Number(freqInputR.value);


  if (!Number.isFinite(fL)) return;

  if (!Number.isFinite(fR)) return;


  fL =
    clampFrequency(fL);

  fR =
    clampFrequency(fR);


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



// ======================================================
// 波形変更
// ======================================================

function updateWaveform() {

  if (!audioCtx) return;


  oscL.type =
    waveL.value;


  oscR.type =
    waveR.value;

}



// ======================================================
// 音量変更
// ======================================================

function updateVolume() {

  if (!audioCtx) return;


  const leftVolume =
    Number(volumeL.value) / 100;


  const rightVolume =
    Number(volumeR.value) / 100;


  let leftTarget = 0;

  let rightTarget = 0;



  if (playMode === "both") {

    leftTarget =
      leftVolume;

    rightTarget =
      rightVolume;

  }


  else if (playMode === "left") {

    leftTarget =
      leftVolume;

    rightTarget =
      0;

  }


  else if (playMode === "right") {

    leftTarget =
      0;

    rightTarget =
      rightVolume;

  }


  else {

    leftTarget = 0;

    rightTarget = 0;

  }



  const now =
    audioCtx.currentTime;



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



// ======================================================
// 周波数制限
// ======================================================

function clampFrequency(f) {

  return Math.min(
    20000,
    Math.max(
      20,
      f
    )
  );

}



// ======================================================
// スライダー → 周波数
//
// 0 ～ 1000
//
// ↓ 対数変換
//
// 20 Hz ～ 20000 Hz
// ======================================================

function sliderToFrequency(value) {

  const minF = 20;

  const maxF = 20000;


  const t =
    value / 1000;


  return (
    minF *
    Math.pow(
      maxF / minF,
      t
    )
  );

}



// ======================================================
// 周波数 → スライダー
// ======================================================

function frequencyToSlider(frequency) {

  const minF = 20;

  const maxF = 20000;


  frequency =
    clampFrequency(frequency);


  const t =
    Math.log(
      frequency / minF
    ) /
    Math.log(
      maxF / minF
    );


  return Math.round(
    t * 1000
  );

}



// ======================================================
// 画面サイズ変更
// ======================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );

}
