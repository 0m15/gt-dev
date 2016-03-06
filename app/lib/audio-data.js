import trackData from '../data/track-data'

const audioData = {
  beats: trackData.beats,
  bars: trackData.bars,
  segments: trackData.segments,
  tatums: trackData.tatums,
  info: {
    bpm: trackData.track.tempo,
    key: trackData.track.key,
    fadeOutStart: trackData.track.start_of_fade_out,
    loudness: trackData.track.loudness
  },
  scenes: trackData.sections
}

// AUDIO STUFF
export {audioData}

export function getBeatsByTime() {
  const beats = {}
  audioData.beats.forEach(b => {
    beats[b.start.toFixed(1)] = { duration: b.duration, end: b.start + b.duration, confidence: b.confidence}
  })
  return beats
}

export function getTatumsByTime() {
  const tatums = {}
  audioData.tatums.forEach(b => {
    tatums[b.start.toFixed(1)] = { duration: b.duration, end: b.start + b.duration, confidence: b.confidence}
  })
  return tatums
}

export function getBarsByTime() {
  const bars = {}
  audioData.bars.forEach(b => {
    bars[b.start.toFixed(1)] = { 
      start: b.start,
      duration: b.duration, 
      end: b.start + b.duration, confidence: b.confidence
    }
  })
  return bars
}

export function getSegmentsByTime() {
  const segments = {}
  audioData.segments.forEach(b => {
    segments[b.start.toFixed(1)] = { 
      start: b.start,
      duration: b.duration, 
      end: b.start + b.duration, 
      confidence: b.confidence,
      loudnessStart: b.loudness_start,
      loudnessMax: b.loudness_max,
      loudnessMaxTime: b.loudness_max_time,
      timbre: b.timbre
    }
  })
  return segments
}

export function getScenesByTime() {
  const scenes = {}
  audioData.scenes.forEach(b => {
    scenes[b.start.toFixed(0)] = { 
      start: b.start,
      duration: b.duration, 
      end: b.start + b.duration,
      confidence: b.confidence,
      key: b.key,
      loudness: b.loudness,
    }
  })
  return scenes
}

