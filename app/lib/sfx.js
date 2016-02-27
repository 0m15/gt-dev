

export function playSfx(id='sfx01', volume=0.4) {
  var audio = document.getElementById(id)
  audio.currentTime = 0  
  audio.volume = volume
  audio.play()
}