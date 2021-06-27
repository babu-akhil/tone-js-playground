let ready = false;

let scaleNotes = Tonal.Scale.get("C2 minor").notes;

let chords = [];
let currentChord = 0;
let nextChord = 0;

let poly;
let FFT; // Fast Fourier Transform.

//-------------------------------------------------------
// Create a new canvas to match the browser size
function setup() {
  createCanvas(windowWidth, windowHeight);

  // generate all the chords in our scale
  // (harmonizing the scale)
  for (let i = 0; i < scaleNotes.length; i++) {
    let chord = [];

    chord[0] = getMidiNote(i, scaleNotes);
    chord[1] = getMidiNote(i + 2, scaleNotes);
    chord[2] = getMidiNote(i + 4, scaleNotes);
    chord[3] = getMidiNote(i + 6, scaleNotes);
    chord[4] = getMidiNote(i + 7, scaleNotes);
    chord[5] = getMidiNote(i + 9, scaleNotes);
    chord[6] = getMidiNote(i + 11, scaleNotes);

    //console.log(chord);
    chords.push(chord);
  }
}

//-------------------------------------------------------
function initializeAudio() {
  Tone.Master.volume.value = -9; // turn it down a bit

  Tone.Transport.bpm.value = 60; // default 120

  poly = new Tone.PolySynth(Tone.AMSynth, {
    envelope: {
      attack: 1,
      release: 3
    },
    volume: -5
  });
  

  // Create 2 different melodic motifs
  let motif = new Motif([0,0,0,0,0,0], "xx-x--x-xxx--x--x--xxxx-");
  let motif2 = new Motif([0,0,0,0,0,0], "-x-xx-x-x-xx---x-xx", "8n", "16n", 7); // 7 -> one octaave higher

  // Feed the two motifs into a Delay effect, for fun
  let delay = new Tone.FeedbackDelay("8n.", 0.5);
  motif.synth.connect(delay);
  motif2.synth.connect(delay);
  
  let lfo = new Tone.LFO("16m", 400, 12000)
  let filter = new Tone.Filter(400, 'lowpass');
  let reverb = new Tone.Reverb(5)
  poly.connect(reverb); // Tone.Master


  reverb.toDestination();
  lfo.connect(filter.frequency)
  delay.connect(filter);

  filter.toDestination();

  // Create a constant drone note that will just play in the background
  // The drone is the first note of our scale, 2 octaves down.
  let drone = new Tone.Synth();
  drone.oscillator.type = "fattriangle";
  drone.toDestination();
  drone.triggerAttack(getMidiNote(-14, scaleNotes));

  // The FFT object is used to analyse the sound that we are hearing
  // and display the volume of individual frequency 'bins'
  // This FFT is dividing the spectrum into 1024 bins.
  FFT = new Tone.FFT(1024); // this number has to be a power of 2
  Tone.Master.connect(FFT);

  // This schedules our changeChord function 1 second from the start
  // of the transport
  Tone.Transport.schedule(changeChord, "1");
  lfo.start()
  Tone.Transport.start();
}

//-------------------------------------------------------
function changeChord(time) {
  currentChord = nextChord;
  let duration = floor(random(1, 4)) + "m";
  poly.triggerAttackRelease(chords[currentChord], duration, time);
  nextChord = floor(random(chords.length));

  // Here, we recursively schedule changeChord based on the new
  // chord duration that was just generated
  // the + sign means "from now"
  Tone.Transport.schedule(changeChord, "+" + duration);
}

//-------------------------------------------------------
// See the previous week's lesson for an explanation on how this
// function works!
function getMidiNote(noteNumber, notes) {
  let numNotes = notes.length;
  let i = modulo(noteNumber, numNotes);
  let note = notes[i];
  // ** fixed!  should now work with scales that don't start
  // in C :-)
  // thanks to YouTube user Mark Lee for pointing this out!
  let octaveTranspose = floor(noteNumber / numNotes);
  let interval = Tonal.Interval.fromSemitones(octaveTranspose * 12);
  return Tonal.Note.transpose(note, interval);
}

//-------------------------------------------------------
// See the previous week's lesson for an explanation on how this
// function works!
function modulo(n, m) {
  return ((n % m) + m) % m;
}

//-------------------------------------------------------
// On window resize, update the canvas size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//-------------------------------------------------------
// Main render loop
function draw() {
  if (!ready) {
    background(0);
    fill(255);
    textAlign(CENTER);
    text("CLICK TO START", width / 2, height / 2);
  } else {
    background(0, 25);
    stroke(255);

    let buffer = FFT.getValue(0);

        console.log(buffer)
    }
  }

//-------------------------------------------------------
function mousePressed() {
  if (!ready) {
    initializeAudio();
    ready = true;
  } else {
    // click again to start/stop...
    if (Tone.Transport.state == "paused") Tone.Transport.start();
    else if (Tone.Transport.state == "started") Tone.Transport.pause();
  }
}

//-------------------------------------------------------
class Motif {
  constructor(
    motifArray,
    rhythmArray,
    tempo = "8n",
    duration = "8n",
    offset = 0
  ) {
    this.tempo = tempo;
    this.duration = duration;
    this.offset = offset;
    this.motifArray = motifArray;
    this.rhythmArray = rhythmArray;

    this.synth = new Tone.FMSynth();
    this.synth.volume.value = -6;
    //commented out because we are connecting into a Delay instead
    //this.synth.toDestination();

    // the generate function is declared below
    this.motif = generate(motifArray);
    this.rhythm = generate(rhythmArray);

    //Function to change the motif over time

    this.growth = new Tone.Loop(time => {
        let param = floor(random(-2,3))
        this.motifArray.shift()
        param = param + this.motifArray[this.motifArray.length-1]
        this.motifArray = [...this.motifArray, param]
        this.motif = generate(this.motifArray)
    }, '2m')

    this.rhythmShift = new Tone.Loop(time => {
        let params = random(-1,1)
        if(params<0){ this.tempo = Tone.Time((Tone.Time(this.tempo).toSeconds())/2).toNotation()
                    }
        if(params>0){ this.tempo = Tone.Time((Tone.Time(this.tempo).toSeconds())*2).toNotation()}
        this.duration = this.tempo
    }, '4m')

    // Here we use Tone.js's Loop object to schedule an anonymous function
    // at a regular interval
    this.loop = new Tone.Loop(time => {
        
      let chordNotes = chords[currentChord];

      let noteIndex = this.motif.next().value;
      console.log(this.synth.volume)
      let r = this.rhythm.next().value;

      if (r == "x") {
        let note = getMidiNote(noteIndex + this.offset, chordNotes);
        this.synth.triggerAttackRelease(note, this.duration, time);
      }
    }, this.tempo);

    this.growth.start(1);
    this.rhythmShift.start(1);
    this.loop.start(1);
  }
}


//-------------------------------------------------------
// Use Javascript's generator syntax (* and yield) to
// iterate over an array forever
// 'yields' returns from the function until next() is
// called again, where it will resume from where it left off

function* generate(array) {
  let i = 0;
  while (true) {
    let value = array[i % array.length];
    i++;
    yield value;
  }
}
