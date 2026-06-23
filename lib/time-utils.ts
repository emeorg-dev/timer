export function pad(n: number) {
  return n.toString().padStart(2, "0")
}

export function secondsToTime(totalSeconds: number) {
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}
