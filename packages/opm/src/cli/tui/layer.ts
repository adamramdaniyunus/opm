import { run as runTui, type TuiInput } from "@opm/tui"
import { Global } from "@opm/core/global"
import { AppNodeBuilder } from "@opm/core/effect/app-node-builder"
import { Effect } from "effect"

export function run(input: TuiInput) {
  return runTui(input).pipe(Effect.provide(AppNodeBuilder.build(Global.node)))
}
