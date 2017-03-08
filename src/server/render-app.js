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
  <script src="${isProd ? STATIC_PATH : `http://localhost:${WDS_PORT}/dist`}/js/bundle.js"></script>
</body>
</html>
`

export default renderApp
