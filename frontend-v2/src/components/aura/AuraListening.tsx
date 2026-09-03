"use client";

import { useEffect, useRef } from "react";
import type { AuraVoiceStatus } from "@/lib/aura/voice/useAuraVoice";
import { AuraMark } from "./AuraMark";
import { AuraVoiceCue } from "./AuraVoiceCue";
import styles from "./AuraListening.module.css";

interface AuraListeningProps {
  /** Only ever one of the three states this surface exists for. */
  status: Extract<AuraVoiceStatus, "REQUESTING" | "LISTENING" | "PROCESSING">;
  /** First microphone use in this browser: the surface introduces itself, once. */
  introducing: boolean;
  elapsedSeconds: number;
  /** Only in the last few seconds, and beside the elapsed clock rather than instead of it. */
  secondsLeft: number | null;
  onDone: () => void;
  onCancel: () => void;
  /** Microphone loudness, about ten times a second. Absent when nothing is measuring it. */
  subscribeToLevel?: (listener: (level: number) => void) => () => void;
}

/**
 * What Aura looks like while it is listening.
 *
 * <p>A5.2 owner finding 3: with recording shown only as a change of colour on a 44px button, the
 * owner could not tell whether Aura was actually hearing anything. A tinted icon is a state badge,
 * and what a person needs at that moment is not a badge — it is evidence. So recording takes over
 * the composer entirely and gives four independent answers to "is this working?": the Spark in its
 * listening state, a meter that moves with the room, a clock that is visibly counting, and the word
 * "Listening" written out.
 *
 * <p>Deliberately <em>not</em> the WhatsApp or ChatGPT treatment. Those are a red dot and a
 * scrolling waveform sitting in a message row; this is a stage that replaces the composer, built
 * from the Spark's own geometry — rounded bars whose opacity descends from the centre outwards
 * exactly as the Spark's four rays do — so what a visitor sees is Aura listening rather than a
 * generic recorder embedded in Aura.
 *
 * <p>The meter is informational and nothing else. It never decides when a sentence has ended, never
 * stops a recording, never influences a transcript and is not a safety control — A5.1's decision
 * not to run voice activity detection stands, because Tamil and Tanglish both carry pauses that a
 * detector reads as the end of a thought, and cutting somebody off mid-sentence is far worse than
 * one extra tap. The visitor decides when they have finished. This only ever says "I can hear you".
 */
export function AuraListening({
  status,
  introducing,
  elapsedSeconds,
  secondsLeft,
  onDone,
  onCancel,
  subscribeToLevel,
}: AuraListeningProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const listening = status === "LISTENING";
  const processing = status === "PROCESSING";

  /*
   * The level is written straight onto the meter element as a custom property rather than held in
   * state. It arrives ten times a second; as state it would re-render the panel — and with it the
   * whole conversation — ten times a second in order to animate nine bars. The elapsed clock, at
   * once a second, is ordinary state, and the difference between the two is exactly that rate.
   */
  useEffect(() => {
    if (!subscribeToLevel || !listening) return;
    const meter = meterRef.current;
    if (!meter) return;

    const unsubscribe = subscribeToLevel((level) => {
      meter.style.setProperty("--aura-level", level.toFixed(2));
    });
    return () => {
      unsubscribe();
      meter.style.removeProperty("--aura-level");
    };
  }, [listening, subscribeToLevel]);

  /*
   * Focus has to be caught twice, and both times for the same reason: the element holding it has
   * just been unmounted, and focus left on nothing falls to the document body — which takes a
   * keyboard visitor out of the dialog's Tab cycle entirely.
   *
   * On the way in it goes to Done, which is both inside the dialog and the control they are most
   * likely to want next. When transcription starts and Done goes, it goes to the stage itself,
   * which is why that carries tabIndex={-1}: focusable deliberately, and excluded from the Tab
   * order just as deliberately, so it holds focus for the second or two it needs to and never
   * becomes a stop on the way round.
   */
  useEffect(() => {
    if (processing) {
      stageRef.current?.focus({ preventScroll: true });
    } else {
      doneRef.current?.focus({ preventScroll: true });
    }
  }, [processing]);

  // `data-state` and `data-meter` describe the surface rather than style it: the stylesheet is
  // read from disk by the layout contract tests, and these are how a component test finds a meter
  // that is deliberately invisible to assistive technology and has no accessible name to query by.
  return (
    <div className={styles.stage} ref={stageRef} tabIndex={-1} data-state={status}>
      <div className={styles.headline}>
        <AuraMark state={processing ? "PROCESSING_AUDIO" : "LISTENING"} size={22} />
        <p className={styles.state}>
          {processing ? "Understanding…" : listening ? "Listening…" : "Waiting for the microphone…"}
        </p>
      </div>

      {/* Once, the first time this browser reaches for the microphone. Not a permanent row: the
          owner's finding was that a language banner took conversation space from every visitor in
          order to say something that only matters at this moment. */}
      {introducing && !processing ? <AuraVoiceCue className={styles.intro} /> : null}

      {processing ? (
        // The meter has nothing left to measure — the microphone is already released — so it is
        // replaced rather than frozen, which would look like a recording that had stopped working.
        <div className={styles.working} data-meter="working" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : (
        <div className={styles.meter} ref={meterRef} data-meter="level" aria-hidden="true">
          {METER_BARS.map((weight, index) => (
            <span
              key={index}
              className={styles.bar}
              style={{ "--bar-weight": weight } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Only while something is actually being timed. A frozen clock under "Understanding…" reads
          as a recording that is still running, which is the opposite of what has happened.

          Not announced, either: a clock that spoke every second would make the microphone unusable
          with a screen reader, and the state above already says what is happening. */}
      {!processing ? (
        <p className={styles.clock} aria-hidden="true">
          <span className={styles.elapsed}>{formatElapsed(elapsedSeconds)}</span>
          {secondsLeft !== null ? <span className={styles.remaining}>{secondsLeft}s left</span> : null}
        </p>
      ) : null}

      {!processing ? (
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onCancel} aria-label="Cancel recording">
            Cancel
          </button>
          <button
            ref={doneRef}
            type="button"
            className={styles.done}
            onClick={onDone}
            aria-label="Done — stop recording"
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * How much of the measured level each bar takes, centre outwards. One number is being shown, shaped
 * — not nine independent measurements and not a random animation, either of which would be showing
 * a visitor something that is not true.
 */
const METER_BARS = [0.35, 0.55, 0.78, 0.92, 1, 0.92, 0.78, 0.55, 0.35];

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
