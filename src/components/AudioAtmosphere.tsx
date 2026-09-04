import { useEffect, useRef, useState } from "react";
import { VolumeX } from "lucide-react";

export function AudioAtmosphere() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const startAmbience = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master gain for smooth fading
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 3.0);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Filter: warm low pass that mimics haute-couture runway reverb
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(280, ctx.currentTime);
      filter.Q.setValueAtTime(3.5, ctx.currentTime);
      filter.connect(masterGain);

      // Low frequency oscillator to breathe the filter
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 12 second breath
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(140, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      // Drone Oscillator 1 (A1 - 55Hz, deep warm sub)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(55, ctx.currentTime);
      const osc1Gain = ctx.createGain();
      osc1Gain.gain.setValueAtTime(0.6, ctx.currentTime);
      osc1.connect(osc1Gain);
      osc1Gain.connect(filter);
      osc1.start();

      // Drone Oscillator 2 (E2 - 82.4Hz, harmonic 5th)
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(82.4, ctx.currentTime);
      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      osc2.start();

      // Drone Oscillator 3 (A2 - 110Hz, slightly detuned for shimmer)
      const osc3 = ctx.createOscillator();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(110.2, ctx.currentTime);
      const osc3Gain = ctx.createGain();
      osc3Gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc3.connect(osc3Gain);
      osc3Gain.connect(filter);
      osc3.start();

      nodesRef.current = [lfo, osc1, osc2, osc3];
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const stopAmbience = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime);
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      setTimeout(() => {
        nodesRef.current.forEach((node) => {
          if ("stop" in node && typeof (node as AudioScheduledSourceNode).stop === "function") {
            try {
              (node as AudioScheduledSourceNode).stop();
            } catch {
              // ignore
            }
          }
        });
        if (ctx.state !== "closed") {
          ctx.close().catch(() => {});
        }
        audioCtxRef.current = null;
        gainNodeRef.current = null;
        nodesRef.current = [];
        setIsPlaying(false);
      }, 1250);
    } else {
      setIsPlaying(false);
    }
  };

  const toggle = () => {
    if (isPlaying) {
      stopAmbience();
    } else {
      startAmbience();
    }
  };

  return (
    <button
      onClick={toggle}
      className="group flex items-center gap-2 rounded-full border border-ivory/20 bg-ink/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ivory/80 backdrop-blur-md transition-all duration-300 hover:border-chartreuse hover:text-chartreuse"
      title={isPlaying ? "Mute runway atmosphere" : "Play ambient runway atmosphere"}
      aria-label={isPlaying ? "Mute runway atmosphere" : "Play ambient runway atmosphere"}
    >
      {isPlaying ? (
        <>
          <div className="flex items-end gap-[3px] h-3 w-3.5" aria-hidden="true">
            <span className="w-[2px] bg-chartreuse animate-[soundbar_0.8s_ease-in-out_infinite_alternate]" style={{ height: "60%" }} />
            <span className="w-[2px] bg-chartreuse animate-[soundbar_0.6s_ease-in-out_infinite_alternate_0.2s]" style={{ height: "100%" }} />
            <span className="w-[2px] bg-chartreuse animate-[soundbar_0.9s_ease-in-out_infinite_alternate_0.4s]" style={{ height: "40%" }} />
            <span className="w-[2px] bg-chartreuse animate-[soundbar_0.7s_ease-in-out_infinite_alternate_0.1s]" style={{ height: "80%" }} />
          </div>
          <span className="hidden sm:inline font-mono">Soundtrack / SS26</span>
        </>
      ) : (
        <>
          <VolumeX size={13} className="text-ivory/60 group-hover:text-chartreuse transition-colors" />
          <span className="hidden sm:inline font-mono">Runway Audio</span>
        </>
      )}
    </button>
  );
}

