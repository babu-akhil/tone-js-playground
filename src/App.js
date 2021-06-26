import { useState, useEffect} from 'react'
import * as Tone from 'tone'
import BD from "./assets/sounds/bd01.wav"
import CH from "./assets/sounds/ch02.wav"
import SD from "./assets/sounds/sd11.wav"
import OH from "./assets/sounds/oh02.wav"
import Sample from "./assets/sounds/Keys 1.wav"

import './App.css'


Tone.Transport.bpm.value = 100;


function Sequencer(props){

  function toggle(e){
    let newNotesState = props.notesState;
    newNotesState[parseInt(e.target.id)] = newNotesState[parseInt(e.target.id)] === null?'C3': null;
    props.setnotesState(newNotesState);
    props.SequenceObject.set({events: newNotesState});
    e.target.className = e.target.className === 'disabled' ? 'active': 'disabled'
  }

  return(<div className = 'Sequencer'>
    {props.notesState.map((item, index) => {if(item===null){return (<button key = {index} id = {index} className = 'disabled' onClick = {toggle}>{((index)%8)}</button>)}
                                              else{return(<button key = {index} id = {index} className = 'active' onClick = {toggle}>{((index)%8)}</button>)}})}
    <span>{props.name}</span>
  </div>)

}

let BDSequence;
let SDSequence;
let CHSequence;
let OHSequence;
let SampleSequence;

function App(){
  Tone.Transport.bpm.value = 85;
  let [bdNoteSequence, setbdNoteSequence] = useState(Array(16).fill(null))

  let [BDisLoaded, setBDisLoaded] = useState(false);

  let BDSample = new Tone.Sampler({urls: {C3:BD}, onload: () => {
    BDSequence = new Tone.Sequence((time, note) => {BDSample.triggerAttackRelease(note, "8n", time)}, bdNoteSequence).start(0);
    BDSample.volume.value = -12;
    setBDisLoaded(true);
    }}).toDestination();

  let [sdNoteSequence, setsdNoteSequence] = useState(Array(16).fill(null))

  let [SDisLoaded, setSDisLoaded] = useState(false);

  let SDSample = new Tone.Sampler({urls: {C3:SD}, onload: () => {
    SDSequence = new Tone.Sequence((time, note) => {SDSample.triggerAttackRelease(note, "8n", time)}, sdNoteSequence).start(0);
    SDSample.volume.value = -12;
    setSDisLoaded(true);
    }}).toDestination();  

  let [chNoteSequence, setchNoteSequence] = useState(Array(16).fill(null))

  let [CHisLoaded, setCHisLoaded] = useState(false);

  let CHSample = new Tone.Sampler({urls: {C3:CH}, onload: () => {
    CHSequence = new Tone.Sequence((time, note) => {CHSample.triggerAttackRelease(note, "8n", time)}, chNoteSequence).start(0);
    CHSample.volume.value = -30
    setCHisLoaded(true);
    }}).toDestination();      

  let [ohNoteSequence, setohNoteSequence] = useState(Array(16).fill(null))

  let [OHisLoaded, setOHisLoaded] = useState(false);

  let OHSample = new Tone.Sampler({urls: {C3:OH}, onload: () => {
    OHSequence = new Tone.Sequence((time, note) => {OHSample.triggerAttackRelease(note, "8n", time)}, ohNoteSequence).start(0);
    OHSample.volume.value = -30
    setOHisLoaded(true);
    }}).toDestination();      


  let [sampleNoteSequence, setsampleNoteSequence] = useState(Array(16).fill(null))

  let [sampleisLoaded, setsampleisLoaded] = useState(false);

  let sampleSample = new Tone.Sampler({urls: {C3:Sample}, onload: () => {
    SampleSequence = new Tone.Sequence((time, note) => {sampleSample.triggerAttackRelease(note, 8, time)}, sampleNoteSequence).start(0);
    sampleSample.volume.value = -24;
    setsampleisLoaded(true);
    }}).toDestination();      

    

  function play(){
    Tone.start();
    Tone.Transport.toggle();
  }

  return(<div id = 'App'><button disabled = {!(BDisLoaded && SDisLoaded && CHisLoaded && OHisLoaded)} onClick = {play}>Play/Pause</button>
  <div id = 'Tracks'>
    <Sequencer SequenceObject = {BDSequence} notesState = {bdNoteSequence} setnotesState = {setbdNoteSequence} name= 'KI '></Sequencer>
    <Sequencer SequenceObject = {SDSequence} notesState = {sdNoteSequence} setnotesState = {setsdNoteSequence} name = 'SN '></Sequencer>
    <Sequencer SequenceObject = {CHSequence} notesState = {chNoteSequence} setnotesState = {setchNoteSequence} name = 'CH'></Sequencer>
    <Sequencer SequenceObject = {OHSequence} notesState = {ohNoteSequence} setnotesState = {setohNoteSequence} name = 'OH'></Sequencer>
    <Sequencer SequenceObject = {SampleSequence} notesState = {sampleNoteSequence} setnotesState = {setsampleNoteSequence} name = 'SA'></Sequencer>
  </div>
  </div>)
}

export default App