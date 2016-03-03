function getAudioContext() {
  return (window.AudioContext||window.webkitAudioContext)
}

export default function fft(id) {

  var audio = document.getElementById('track')

  return { audio }
}