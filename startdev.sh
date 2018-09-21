#!/bin/sh

SESSION_NAME='pong'

tmux has-session -t ${SESSION_NAME}

if [ $? != 0 ]
then
  tmux new-session -s ${SESSION_NAME} -n editor -d
  tmux send-keys -t ${SESSION_NAME} ${EDITOR}\ . C-m

  tmux new-window -n nodemon -t ${SESSION_NAME}
  tmux send-keys -t ${SESSION_NAME}:nodemon 'yarn start' C-m

  tmux new-window -n wds -t ${SESSION_NAME}
  tmux send-keys -t ${SESSION_NAME}:wds 'yarn dev:wds' C-m

  tmux select-window -t ${SESSION_NAME}:0
fi
tmux attach -t ${SESSION_NAME}
