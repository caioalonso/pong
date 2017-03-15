export const WDS_PORT = 7000
export const WEB_PORT = process.env.PORT || 3000
export const STATIC_PATH = '/static'
export const APP_NAME = 'Pong'
export const GAME = {
  barHeight: 10,
  centerSpacing: 60,
  topPadding: 10,
  rectWidth: 10,
  rectHeight: () => window.innerHeight / 10,
  rectMargin: 20,
  ballSize: () => window.innerHeight / 100
}
