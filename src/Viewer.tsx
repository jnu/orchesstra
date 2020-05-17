import React, {useEffect, useState} from 'react';
import Chess, {ChessInstance, Move} from 'chess.js';


export interface ViewerProps {
  game: ChessInstance;
}

function newGame() {
  // @ts-ignore
  const c = new Chess();
  return c as ChessInstance;
}

class Instrument {
  ctx: AudioContext;
  osc: OscillatorNode[] = [];
  gain: GainNode[] = [];

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
  }

  public init() {
    this.setup();
    this.connect();
    return this;
  }

  public setPitch(freq: number) {
    this.getFrequencies(freq).forEach((f, i) => {
      this.osc[i].frequency.setValueAtTime(f, this.ctx.currentTime);
    });
  }

  public play(gain: number = 0.5) {
    const gains = this.getGain(gain);
    gains.forEach((g, i) => this.gain[i].gain.value = g);
  }

  public rest() {
    this.gain.forEach(g => g.gain.value = 0);
  }

  public stop() {
    this.gain.forEach(g => g.gain.value = 0);
    this.osc.forEach(o => o.stop());
  }

  protected getFrequencies(freq: number) {
    return this.osc.map(() => freq);
  }

  protected getGain(gain: number) {
    return this.gain.map(() => gain);
  }

  protected setup() {
    throw new Error('not implemented');
  }

  private connect() {
    for (let g of this.gain) {
      g.connect(this.ctx.destination);
    }

    for (let o of this.osc) {
      o.start();
    }
  }
}

class PawnInstrument extends Instrument {
  protected setup() {
    this.gain = [this.ctx.createGain()];

    this.osc = [this.ctx.createOscillator()];

    for (let o of this.osc) {
      o.type = 'sawtooth';
      o.connect(this.gain[0]);
    }
  }
}

class KnightInstrument extends Instrument {
  protected setup() {
    const mainGain = this.ctx.createGain();
    const overtoneGain = this.ctx.createGain();
    this.gain = [mainGain, overtoneGain];

    const mainOsc = this.ctx.createOscillator();
    const overtoneOsc = this.ctx.createOscillator();
    mainOsc.type = 'triangle';
    overtoneOsc.type = 'square';
    mainOsc.connect(mainGain);
    overtoneOsc.connect(overtoneGain);
    this.osc = [mainOsc, overtoneOsc];
  }

  protected getFrequencies(f: number) {
    return [f, f * 3.01];
  }

  protected getGain(g: number) {
    return [g, g / 3];
  }
}

class BishopInstrument extends Instrument {
  protected setup() {
    const mainGain = this.ctx.createGain();
    const overtoneGain = this.ctx.createGain();
    this.gain = [mainGain, overtoneGain];

    const mainOsc = this.ctx.createOscillator();
    const overtoneOsc = this.ctx.createOscillator();
    mainOsc.type = 'square';
    overtoneOsc.type = 'triangle';
    mainOsc.connect(mainGain);
    overtoneOsc.connect(overtoneGain);
    this.osc = [mainOsc, overtoneOsc];
  }

  protected getFrequencies(f: number) {
    return [f, f / 2];
  }

  protected getGain(g: number) {
    return [g, g / 3];
  }
}

class RookInstrument extends Instrument {
  protected setup() {
    const mainGain = this.ctx.createGain();
    const overtoneGain = this.ctx.createGain();
    this.gain = [mainGain, overtoneGain];

    const mainOsc = this.ctx.createOscillator();
    const overtoneOsc = this.ctx.createOscillator();
    mainOsc.type = 'square';
    overtoneOsc.type = 'sine';
    mainOsc.connect(mainGain);
    overtoneOsc.connect(overtoneGain);
    this.osc = [mainOsc, overtoneOsc];
  }

  protected getFrequencies(f: number) {
    return [f / 2, f / 3];
  }

  protected getGain(g: number) {
    return [g, g / 3];
  }
}

class QueenInstrument extends Instrument {
  protected setup() {
    const mainGain = this.ctx.createGain();
    const overtoneGain = this.ctx.createGain();
    this.gain = [mainGain, overtoneGain];

    const mainOsc = this.ctx.createOscillator();
    const overtoneOsc = this.ctx.createOscillator();
    mainOsc.type = 'sawtooth';
    overtoneOsc.type = 'sine';
    mainOsc.connect(mainGain);
    overtoneOsc.connect(overtoneGain);
    this.osc = [mainOsc, overtoneOsc];
  }

  protected getFrequencies(f: number) {
    return [f / 2, f * 2];
  }

  protected getGain(g: number) {
    return [g, g / 3];
  }
}

class KingInstrument extends Instrument {
  protected setup() {
    const mainGain = this.ctx.createGain();
    const overtoneGain = this.ctx.createGain();
    this.gain = [mainGain, overtoneGain];

    const mainOsc = this.ctx.createOscillator();
    const overtoneOsc = this.ctx.createOscillator();
    mainOsc.type = 'sine';
    overtoneOsc.type = 'triangle';
    mainOsc.connect(mainGain);
    overtoneOsc.connect(overtoneGain);
    this.osc = [mainOsc, overtoneOsc];
  }

  protected getFrequencies(f: number) {
    return [f / 2, f / 3];
  }

  protected getGain(g: number) {
    return [g, g / 3];
  }
}

function createInstrument(ctx: AudioContext, piece: string, color: string) {
  switch (piece) {
    case 'p':
      return (new PawnInstrument(ctx)).init();
    case 'n':
      return (new KnightInstrument(ctx)).init();
    case 'b':
      return (new BishopInstrument(ctx)).init();
    case 'r':
      return (new RookInstrument(ctx)).init();
    case 'q':
      return (new QueenInstrument(ctx)).init();
    case 'k':
      return (new KingInstrument(ctx)).init();
    default:
      throw new Error("invalid instrument");
  }
}

class Orchesstra {
  public readonly ctx: AudioContext;
  public readonly state: ChessInstance;
  public readonly startTime: number;
  private readonly map: Map<string, {move: Move, inst: Instrument}>;
  private readonly allInsts: Instrument[];

  constructor() {
    // @ts-ignore
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.map = new Map();
    this.state = newGame();
    this.startTime = this.ctx.currentTime;
    this.allInsts = [];
  }

  public time() {
    return 1000 * (this.ctx.currentTime - this.startTime);
  }

  public shutup() {
    while (this.allInsts.length) {
      const inst = this.allInsts.pop();
      if (!inst) {
        continue;
      }
      inst.stop();
    }
  }

  public makeMove(move: Move) {
    this.state.move(move.san);

    if (this.map.has(move.to)) {
      // capture!
      const d = this.map.get(move.to);
      if (d) {
        d.inst.stop();
      }
    }

    if (this.map.has(move.from)) {
      const d = this.map.get(move.from);
      if (!d) {
        throw new Error("unknown error");
      }
      this.map.delete(move.from);
      this.map.set(move.to, {...d, move});
    } else {
      const inst = createInstrument(this.ctx, move.piece, move.color);
      this.allInsts.push(inst);
      this.map.set(move.to, {move, inst});
    }

    this.updateInstruments(move);
  }

  private updateInstruments(move: Move) {
    for (let [pos, d] of Array.from(this.map.entries())) {
      if (move.to === pos) {
        const freq = getFreq(move.to);
        d.inst.setPitch(freq);
        d.inst.play();
      } else if (move.color === d.move.color) {

        const moves = this.state.moves({square: pos, verbose: true});
        let vol = Math.min(0.5, moves.length / 16);
        const canCapture = moves.some(m => m.captured);
        if (canCapture) {
          vol += 0.25;
        }

        d.inst.play(vol)

      }
    }
  }
}

function generateNoteBoard() {
  const notes: number[] = [];
  const startAt = 25;
  for (let i = 0; i < 64; i++) {
    const n = startAt + i;
    const freq = Math.pow(2, (n - 49) / 12) * 440;
    notes[i] = freq;
  }
  return notes;
}

const NOTES = generateNoteBoard();

function getFreq(pos: string) {
  const files = 'abcdefgh';
  const file = pos[0];
  const rank = +pos[1];
  const rankIdx = rank - 1;
  const fileIdx = files.indexOf(file.toLowerCase());
  const n = rankIdx * 8 + fileIdx;
  return NOTES[n];
}


export function Viewer({game}: ViewerProps) {
  const [ctr, setCtr] = useState(0);
  const [orch, setOrch] = useState(null as Orchesstra | null);
  const [progress, setProgress] = useState(0);
  const [moveIdx, setMoveIdx] = useState(-1);

  useEffect(() => {
    setMoveIdx(-1);
    const newOrch = new Orchesstra();
    setOrch(newOrch);
    return () => newOrch.shutup();
  }, [game]);

  useEffect(() => {
    if (!orch) {
      return;
    }
    const raf = requestAnimationFrame(t => {
      const tPerMove = 500;
      const n = game.history().length;
      const tMax = n * tPerMove;
      const p = orch.time() / tMax;
      // Termination
      if (p > 1) {
        setProgress(1);
        setMoveIdx(n);
        setTimeout(() => {
          orch.shutup();
        }, tPerMove * 4);
        return;
      }

      const newMoveIdx = Math.floor(p * n);
      if (newMoveIdx !== moveIdx) {
        setMoveIdx(newMoveIdx);
        const move = game.history({verbose: true})[newMoveIdx];
        orch.makeMove(move);
      }

      setProgress(p);
      setCtr(ctr + 1);
    });

    return () => cancelAnimationFrame(raf);
  });

  return (
    <div>
      <div>{progress}</div>
      <div>{moveIdx}</div>
      <pre>
        {JSON.stringify(game.history({verbose: true})[moveIdx])}
      </pre>
      <pre>
        {orch && orch.state.ascii()}
      </pre>
    </div>
  );
}
