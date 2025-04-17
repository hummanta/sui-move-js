import { WasmFs } from '@wasmer/wasmfs'
import { Disassemble } from '@movefuns/move-js'

export const startDisassembleTask = async () => {
  const wasmfs = new WasmFs()
  const dp = new Disassemble(wasmfs)

  const disassembleContent = document.getElementById('disassemble-content')
  if (!disassembleContent) return

  disassembleContent.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Move Bytecode Disassembler</h2>
      <p class="section-description">Upload and analyze Move bytecode files</p>
    </div>
    <div class="input-container">
      <label class="input-label">Select Move Bytecode File (.mv)</label>
      <input type="file" accept=".mv" class="file-input" />
    </div>
    <pre class="output-display"></pre>
  `

  const fileInput = disassembleContent.querySelector('.file-input')
  const outputDisplay = disassembleContent.querySelector('.output-display')

  fileInput?.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file || !outputDisplay) return

    try {
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const hexString = Array.from(uint8Array)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')

      dp.disassemble(file.name, hexString, (ok: boolean, data: string) => {
        outputDisplay.textContent = ok ? data : `Error disassembling code: ${data}`
        outputDisplay.style.color = ok ? '#f8f8f2' : '#ff6b6b'
      })
    } catch (error) {
      outputDisplay.textContent = `Error: ${
        error instanceof Error ? error.message : String(error)
      }`
      outputDisplay.style.color = '#ff6b6b'
    }
  })
}