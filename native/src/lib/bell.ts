import { createAudioPlayer, type AudioPlayer } from "expo-audio";

// A soft bowl-like bell (synthesised from the same tones as the website's
// bell, so no recording rights are involved). Its own player, so it never
// interrupts the prayer voice.
let bell: AudioPlayer | null = null;

export function ringBell() {
  try {
    bell ??= createAudioPlayer(require("../../assets/sounds/bell.m4a"));
    void bell.seekTo(0).then(() => bell?.play());
  } catch {
    // Sound unavailable; the screen still shows the change.
  }
}
