import ePub from 'npm:epubjs'
import { open } from 'tauri/plugin-dialog'
import { readFile } from 'tauri/plugin-fs'
import { translate } from './translate.ts'

const apiKeyInput = document.getElementById('api-key')
apiKeyInput.value = localStorage.getItem('api-key')
apiKeyInput.addEventListener('change', (e) => {
  localStorage.setItem('api-key', e.target.value)
})

const toLangInput = document.getElementById('to-lang')
toLangInput.value = localStorage.getItem('to-lang')
toLangInput.addEventListener('change', (e) => {
  localStorage.setItem('to-lang', e.target.value)
})

const openBookButton = document.getElementById('open-book')
openBookButton.addEventListener('click', openBook)

async function openBook() {
  const file = await open({ multiple: false, directory: false })
  const contents: Uint8Array = await readFile(file.path)
  const buffer = contents.buffer.slice(
    contents.byteOffset,
    contents.byteLength + contents.byteOffset,
  )
  const book = ePub(buffer)

  const rendition = book.renderTo('viewer', {
    width: '100%',
    height: 600,
    ignoreClass: 'annotator-hl',
    manager: 'continuous',
    allowScriptedContent: true,
    spread: false,
  })

  const prevLocation = localStorage.getItem('previous-location-cfi')
  if (prevLocation) rendition.display(prevLocation)
  else rendition.display()

  book.loaded.navigation.then(function (toc) {
    console.log(toc)
  })

  const next = document.getElementById('next')
  next.addEventListener('click', function () {
    rendition.next()
  }, false)

  const prev = document.getElementById('prev')
  prev.addEventListener('click', function () {
    rendition.prev()
  }, false)

  const keyListener = function (e) {
    if ((e.keyCode || e.which) == 37) rendition.prev()
    if ((e.keyCode || e.which) == 39) rendition.next()
  }

  rendition.on('keyup', keyListener)
  document.addEventListener('keyup', keyListener, false)

  rendition.on('relocated', function (location) {
    localStorage.setItem('previous-location-cfi', location.start.cfi)
  })

  rendition.themes.default({
    '::selection': {
      'background': 'rgba(255,255,0, 0.3)',
    },
    '.epubjs-hl': {
      'fill': 'yellow',
      'fill-opacity': '0.3',
      'mix-blend-mode': 'multiply',
    },
  })

  const highlights = document.getElementById('highlights')

  rendition.on('selected', async (cfiRange, contents) => {
    rendition.annotations.highlight(cfiRange, {}, (e) => {
      console.log('highlight clicked', e.target)
    })
    contents.window.getSelection().removeAllRanges()

    const range = await book.getRange(cfiRange)
    if (!range) return
    const original = range.toString()
    const translation = await translate(original, 'en')

    const originalEl = document.createElement('p')
    originalEl.innerHTML = original

    const translationEl = document.createElement('p')
    translationEl.innerHTML = translation

    const li = document.createElement('li')

    const a = document.createElement('a')
    a.textContent = cfiRange
    a.href = '#' + cfiRange
    a.onclick = function () {
      rendition.display(cfiRange)
    }

    const remove = document.createElement('a')
    remove.textContent = 'remove'
    remove.href = '#' + cfiRange
    remove.onclick = function () {
      rendition.annotations.remove(cfiRange, 'highlight')
      highlights.removeChild(li)
      return false
    }

    li.appendChild(a)
    li.appendChild(originalEl)
    li.appendChild(translationEl)
    li.appendChild(remove)
    highlights.appendChild(li)
  })
}
