import { render } from 'solid-js/web'

function App() {
  return <div>hello!</div>
}

const main = document.getElementById('main')
if (main) {
  main.innerHTML = ''
  render(() => <App />, main)
}
