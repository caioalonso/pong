import { isProd } from '../shared/util'
import { WDS_PORT, STATIC_PATH } from '../shared/config'

const renderApp = (title) =>
`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link rel="stylesheet" href="${STATIC_PATH}/css/style.css">
</head>
<body>
  <section id="pregame">
    <h1>PONG</h1>
    <input id="roomName" placeholder="Room name (optional)"><br>
    <button id="join">JOIN ROOM</button>
    <footer><small>
    © 2016 <a href="https://github.com/caioalonso/pong">Caio Alonso</a>
    </small></footer>
  </section>
  <script src="${isProd ? STATIC_PATH : `http://localhost:${WDS_PORT}/dist`}/js/bundle.js"></script>
</body>
</html>
`

export default renderApp
