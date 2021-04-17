
const AudioPlayer = () => {
  const context = new AudioContext();
  const track = loadAudio('denial.ogg', context);
  document.body.addEventListener('click', function startContext() {
    document.body.removeEventListener('click', startContext);
    // check if context is in suspended state (autoplay policy)
    if (context.state === 'suspended') {
      context.resume();
    }
    track.then(t => t.start());
  });

  const changeSpeed = speed => 
    track.then(t => t.playbackRate.value = speed);

  return {
    changeSpeed
  };
};


const loadAudio = async (filename, context) => {
  const source = context.createBufferSource();

  const response = await fetch(filename);
  const data = await response.arrayBuffer();

  return new Promise(resolve => {
    context.decodeAudioData(data, decoded => {
      source.buffer = decoded;
      // source.playbackRate.value = playbackControl.value;
      source.connect(context.destination);
      source.loop = true;
    });
    resolve(source);
  });
};

export default AudioPlayer;
