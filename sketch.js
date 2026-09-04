let audioCtx;
let merger;

let oscL = null;
let oscR = null;
let gainL = null;
let gainR = null;

let freqL, freqR;
let waveL, waveR;
let volumeL, volumeR;

let bothButton, leftButton, rightButton, stopButton;

function setup() {
  createCanvas(windowWidth, windowHeight);

  textAlign(CENTER, CENTER);

  // =========================
  // 左チャンネル
  // =========================

  freqL = createInput("440", "number");
  freqL.size(100);

  waveL = createSelect();
  waveL.option("サイン波", "sine");
  waveL.option("矩形波", "square");
  waveL.option("三角波", "triangle");
  waveL.option("のこぎり波", "sawtooth");

  volumeL = createSlider(0, 100, 20, 1);
  volumeL.size(150);

  // =========================
  // 右チャンネル
  // =========================

  freqR = createInput("660", "number");
  freqR.size(100);

  waveR = createSelect();
  waveR.option("サイン波", "sine");
  waveR.option("矩形波", "square");
  waveR.option("三角波", "triangle");
  waveR.option("のこぎり波", "sawtooth");

  volumeR = createSlider(0, 100, 20, 1);
  volumeR.size(150);

  // =========================
  // 再生中の変更を即時反映
  // =========================

  freqL.input(updateFrequency);
  freqR.input(updateFrequency);

  waveL.changed(updateWave);
  waveR.changed(updateWave);

  // =========================
  // ボタン
  // =========================

  bothButton = createButton("両方");
  bothButton.size(90, 45);
  bothButton.mousePressed(() => playSound("both"));

  leftButton = createButton("左のみ");
  leftButton.size(90, 45);
  leftButton.mousePressed(() => playSound("left"));

  rightButton = createButton("右のみ");
  rightButton.size(90, 45);
  rightButton.mousePressed(() => playSound("right"));

  stopButton = createButton("停止");
  stopButton.size(90, 45);
  stopButton.mousePressed(stopSound);

  positionControls();
}

function draw() {
  background(245);

  fill(0);

  textSize(28);
  text("左右独立 2チャンネル信号発生器", width / 2, 40);

  // 左
  textSize(22);
  text("左チャンネル", width / 2 - 200, 100);

  textSize(17);
  text("周波数", width / 2 - 200, 145);
  text("Hz", width / 2 - 105, 180);

  text("波形", width / 2 - 200, 230);

  text("音量", width / 2 - 200, 300);
  text(volumeL.value() + "%", width / 2 - 200, 355);

  // 右
  textSize(22);
  text("右チャンネル", width / 2 + 200, 100);

  textSize(17);
  text("周波数", width / 2 + 200, 145);
  text("Hz", width / 2 + 295, 180);

  text("波形", width / 2 + 200, 230);

  text("音量", width / 2 + 200, 300);
  text(volumeR.value() + "%", width / 2 + 200, 355);

  textSize(15);
  text(
    "周波数・波形・音量は再生中でも変更できます",
    width / 2,
    500
  );

  // 音量は常時更新
  updateVolume();
}

// ==================================================
// 配置
// ==================================================

function positionControls() {
  let centerX = width / 2;

  freqL.position(centerX - 250, 165);
  waveL.position(centerX - 255, 245);
  waveL.size(120);
  volumeL.position(centerX - 275, 315);

  freqR.position(centerX + 150, 165);
  waveR.position(centerX + 145, 245);
  waveR.size(120);
  volumeR.position(centerX + 125, 315);

  bothButton.position(centerX - 195, 410);
  leftButton.position(centerX - 95, 410);
  rightButton.position(centerX + 5, 410);
  stopButton.position(centerX + 105, 410);
}

// ==================================================
// 再生
// ==================================================

async function playSound(mode) {
  if (!audioCtx) {
    audioCtx =
      new (window.AudioContext || window.webkitAudioContext)();

    merger = audioCtx.createChannelMerger(2);
    merger.connect(audioCtx.destination);
  }

  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  stopOscillators();

  let fL = Number(freqL.value());
  let fR = Number(freqR.value());

  // 左
  if (mode === "both" || mode === "left") {
    oscL = audioCtx.createOscillator();
    gainL = audioCtx.createGain();

    oscL.frequency.value = fL;
    oscL.type = waveL.value();

    gainL.gain.value = volumeL.value() / 100 * 0.5;

    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);

    oscL.start();
  }

  // 右
  if (mode === "both" || mode === "right") {
    oscR = audioCtx.createOscillator();
    gainR = audioCtx.createGain();

    oscR.frequency.value = fR;
    oscR.type = waveR.value();

    gainR.gain.value = volumeR.value() / 100 * 0.5;

    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);

    oscR.start();
  }
}

// ==================================================
// 周波数をリアルタイム更新
// ==================================================

function updateFrequency() {
  if (!audioCtx) return;

  let fL = Number(freqL.value());
  let fR = Number(freqR.value());

  if (oscL && fL > 0) {
    oscL.frequency.setTargetAtTime(
      fL,
      audioCtx.currentTime,
      0.01
    );
  }

  if (oscR && fR > 0) {
    oscR.frequency.setTargetAtTime(
      fR,
      audioCtx.currentTime,
      0.01
    );
  }
}

// ==================================================
// 波形をリアルタイム更新
// ==================================================

function updateWave() {
  if (oscL) {
    oscL.type = waveL.value();
  }

  if (oscR) {
    oscR.type = waveR.value();
  }
}

// ==================================================
// 音量をリアルタイム更新
// ==================================================

function updateVolume() {
  if (!audioCtx) return;

  if (gainL) {
    gainL.gain.setTargetAtTime(
      volumeL.value() / 100 * 0.5,
      audioCtx.currentTime,
      0.01
    );
  }

  if (gainR) {
    gainR.gain.setTargetAtTime(
      volumeR.value() / 100 * 0.5,
      audioCtx.currentTime,
      0.01
    );
  }
}

// ==================================================
// 停止
// ==================================================

function stopSound() {
  stopOscillators();
}

function stopOscillators() {
  if (oscL) {
    try {
      oscL.stop();
    } catch (e) {}

    oscL.disconnect();
    oscL = null;
  }

  if (gainL) {
    gainL.disconnect();
    gainL = null;
  }

  if (oscR) {
    try {
      oscR.stop();
    } catch (e) {}

    oscR.disconnect();
    oscR = null;
  }

  if (gainR) {
    gainR.disconnect();
    gainR = null;
  }
}

// ==================================================
// 画面サイズ変更
// ==================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionControls();
}