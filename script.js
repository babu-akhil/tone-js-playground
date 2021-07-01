let ready = false;

let synth
let wave;
let loop;
let pingpong;
let reverb;

let scale;

function setup() {
  createCanvas(windowWidth, windowHeight);

  scale = Tonal.Scale.get("C4 minor").notes;
  
  synth = new Tone.Synth();
  pingpong = new Tone.FeedbackDelay("32n", 0.9);
  reverb = new Tone.Reverb({decay: 1.5, preDelay: 0}).toDestination()
  synth.connect(pingpong);
  pingpong.connect(reverb)

  // loop = new Tone.Loop(loopStep, "4n");
  // loop.start();

  wave = new Tone.Waveform();
  Tone.Master.connect(wave);

  Tone.Master.volume.value = -6;
}

// Loop Callback function

// function loopStep(time) {

//   let n = noise(frameCount * 0.1);
//   let i = floor(map(n, 0, 1, 0, scale.length));
//   let note = scale[i]

//   synth.triggerAttackRelease(note, "4n", time);

// }

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  if(ready){
    // Audio stuff
    drawWaveform(wave);
  }
  else {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text("CLICK TO START", width/2, height/2)
  }

}


function drawWaveform(wave, w = width, h = height) {
  stroke(255);
    let buffer = wave.getValue(0);
    let start = 0;

    // Finding start point
    for(let i = 1; i < buffer.length; i++) {

      if(buffer[i-1] < 0 && buffer[i] >= 0)
        {start = i;
        break;}
    }

    // Drawing the waveform
    let end = start + buffer.length/2
    for(let i = start; i < end; i++) {
      let x1 = map(i-1, start, end, 0, width)
      let y1 = map(buffer[i-1], -1, 1, 0, height);
      let x2 = map(i, start, end, 0, width)
      let y2 = map(buffer[i], -1, 1, 0, height);
      line(x1,y1, x2, y2)
    }
  }

function mousePressed() {
  if(!ready) {
    // Start Audio Objects
    ready = true;
    Tone.Transport.start()
  }
}

function keyPressed() {
  console.log(key)
  if(key === 'a') {
    note = scale[0]
    synth.triggerAttackRelease(note, "4n");
  }
  if(key === 's') {
    note = scale[1]
    synth.triggerAttackRelease(note, "4n");
  }
  if(key === 'd') {
    note = scale[2]
    synth.triggerAttackRelease(note, "4n");
  }
  if(key === 'f') {
    note = scale[3]
    synth.triggerAttackRelease(note, "4n");
  }
  if(key === 'g') {
    note = scale[4]
    synth.triggerAttackRelease(note, "4n");
  }
  if(key === 'h') {
    note = scale[5]
    synth.triggerAttackRelease(note, "4n");
  }
  if(key === 'j') {
    note = scale[6]
    synth.triggerAttackRelease(note, "4n");
  }

}