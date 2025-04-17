import { WasmFs } from '@wasmer/wasmfs'
import { Git, MovePackage } from '@movefuns/move-js'

export const startCounterTask = async () => {
  const wasmfs = new WasmFs()
  const git = new Git(wasmfs)

  await git.download('/data/framework.zip', '/workspace/framework')
  await git.download('/data/counter.zip', '/workspace/my-counter')

  const mp = new MovePackage(wasmfs, {
    packagePath: '/workspace/my-counter',
    test: false,
    alias: new Map([['Sui', '/workspace/framework/sui-framework']]),
  })

  await mp.build()

  const blobBuf = wasmfs.fs.readFileSync(
    '/workspace/my-counter/target/sui/release/package.blob'
  )
  const hash = wasmfs.fs.readFileSync(
    '/workspace/my-counter/target/sui/release/hash.txt'
  )
  const base64Data = blobBuf.toString('base64')
  const hex = blobBuf.toString('hex').replace(/^/, '0x')

  const counterContent = document.getElementById('counter-content')
  if (!counterContent) return

  counterContent.innerHTML = `
    <div class="counter-container">
      <div class="editor-section">
        <div class="section-header">
          <h2 class="section-title">Move Contract</h2>
          <p class="section-description">Counter contract source code</p>
        </div>
        <div class="code-editor">
          <pre class="code-block">
/// Module: counter
module counter::counter;

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

public struct Counter {
    value: u64,
}

public fun increment(counter: &mut Counter) {
    counter.value = counter.value + 1;
}

public fun get_value(counter: &Counter): u64 {
    counter.value
}</pre>
        </div>
      </div>
      <div class="result-section">
        <div class="section-header">
          <h2 class="section-title">Compilation Result</h2>
          <p class="section-description">View compiled contract details</p>
        </div>
        <div class="info-grid">
          <div class="info-card">
            <h3>Hex</h3>
            <div class="code-block">${hex}</div>
          </div>
          <div class="info-card">
            <h3>Buffer</h3>
            <div class="code-block">${blobBuf}</div>
          </div>
          <div class="info-card">
            <h3>Base64</h3>
            <div class="code-block">${base64Data}</div>
          </div>
          <div class="info-card">
            <h3>Hash</h3>
            <div class="code-block">${hash}</div>
          </div>
        </div>
      </div>
    </div>
  `
}