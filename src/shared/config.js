export const WDS_PORT = 7000
export const WEB_PORT = process.env.PORT || 3000
export const STATIC_PATH = '/static'
export const APP_NAME = 'Pong'
export const GAME = {
  barHeight: 10,
  centerSpacing: 60,
  topPadding: 10,
  readyPadding: 200,
  rectWidth: 10,
  rectHeight: 80,
  rectMargin: 20,
  ballSize: () => window.innerHeight / 100
}
export const LATENCY = 20
