import { registerCustomTheme } from "@pierre/diffs"
import { OPMTheme } from "./marked-theme"

let registered = false

export function registerOPMTheme() {
  if (registered) return
  registered = true
  registerCustomTheme("OPM", () => Promise.resolve(OPMTheme))
}
