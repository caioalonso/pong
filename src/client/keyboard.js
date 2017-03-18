var keys = {
  'up': [getKey(38), getKey(75)],
  'down': [getKey(40), getKey(74)]
}

function getKey (keyCode) {
  var key = {}
  key.code = keyCode
  key.isDown = false
  key.isUp = true
  key.press = undefined
  key.release = undefined
  key.downHandler = (event) => {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press()
      key.isDown = true
      key.isUp = false
      event.preventDefault()
    }
  }

  key.upHandler = (event) => {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release()
      key.isDown = false
      key.isUp = true
      event.preventDefault()
    }
  }

  window.addEventListener(
    'keydown', key.downHandler.bind(key), false
  )
  window.addEventListener(
    'keyup', key.upHandler.bind(key), false
  )
  return key
}

function oppositeIsPressed (keyName) {
  var toCheck
  if(keyName === 'up') {
    toCheck = keys.down
  } else {
    toCheck = keys.up
  }

  return toCheck.map((key) => key.isDown).reduce((prev, el) => prev || el)
}

export function registerAction (keyName, press, release) {
  for(let key of keys[keyName]) {
    key.press = press
    key.release = () => {
      if(!oppositeIsPressed(keyName)) {
        release()
      }
    }
  }
}
