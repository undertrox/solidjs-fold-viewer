import type { Component } from "solid-js"
import FoldFileViewer from "./FoldFileViewer";

const App: Component = () => {
  return (
    <main class="m-auto p-16 text-center">
      <h1>Fold Viewer</h1>
      <FoldFileViewer/>
    </main>
  )
}

export default App
