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

module.exports= audioData

