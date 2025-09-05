#!/bin/bash
#
export PATH=$PATH:$HOME/.bun/bin;
source ~/.bashrc;

pm2 startOrReload ecosystem.config.cjs --update-env;
pm2 save;
