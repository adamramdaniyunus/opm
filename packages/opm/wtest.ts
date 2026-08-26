const file = new URL("./src/cli/tui/worker.ts", import.meta.url)
const worker = new Worker(file)
worker.onerror = (e: ErrorEvent) => {
  console.log("WORKER ERROR:", e.message)
}
worker.onmessage = (e: MessageEvent<string>) => {
  console.log("worker msg:", e.data)
}
try {
  worker.postMessage(JSON.stringify({ type: "rpc.request", method: "snapshot", input: undefined, id: 1 }))
  console.log("postMessage OK")
} catch (e) {
  console.log("postMessage threw:", e)
}
setTimeout(() => {
  worker.terminate()
  process.exit(0)
}, 8000)