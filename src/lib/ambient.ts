/**
 * A soft ambient pad synthesised with Web Audio, so there's no audio file to
 * ship. A slow, filtered Cmaj9 chord plus a faint champagne fizz.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function build(audio: AudioContext) {
  const out = audio.createGain();
  out.gain.value = 0;
  out.connect(audio.destination);

  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.6;
  filter.connect(out);

  // Slow breathing on the filter.
  const lfo = audio.createOscillator();
  const lfoDepth = audio.createGain();
  lfo.frequency.value = 0.05;
  lfoDepth.gain.value = 350;
  lfo.connect(lfoDepth).connect(filter.frequency);
  lfo.start();

  // C3, G3, B3, D4, E4
  [130.81, 196, 246.94, 293.66, 329.63].forEach((freq, i) => {
    for (const detune of [-7, 7]) {
      const osc = audio.createOscillator();
      osc.type = i % 2 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const voice = audio.createGain();
      voice.gain.value = 0.05;
      // Each voice swells at its own slow rate.
      const swell = audio.createOscillator();
      const swellDepth = audio.createGain();
      swell.frequency.value = 0.03 + i * 0.017;
      swellDepth.gain.value = 0.03;
      swell.connect(swellDepth).connect(voice.gain);
      osc.connect(voice).connect(filter);
      osc.start();
      swell.start();
    }
  });

  // Fizz: very quiet high-passed noise.
  const noise = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (Math.random() < 0.02 ? 1 : 0.15);
  const src = audio.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const hp = audio.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 5000;
  const fizz = audio.createGain();
  fizz.gain.value = 0.012;
  src.connect(hp).connect(fizz).connect(out);
  src.start();

  return out;
}

export function startAmbient() {
  if (!ctx) {
    ctx = new AudioContext();
    master = build(ctx);
  }
  void ctx.resume();
  const now = ctx.currentTime;
  master!.gain.cancelScheduledValues(now);
  master!.gain.setValueAtTime(master!.gain.value, now);
  master!.gain.linearRampToValueAtTime(0.5, now + 2.5);
}

export function stopAmbient() {
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 0.8);
  const audio = ctx;
  window.setTimeout(() => {
    if (master && master.gain.value < 0.01) void audio.suspend();
  }, 900);
}
