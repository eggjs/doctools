#! /usr/bin/env bash

openssl aes-256-cbc -K $encrypted_28400b888db2_key -iv $encrypted_28400b888db2_iv -in test/deploy_key.enc -out deploy_key -d
chmod 600 deploy_key
eval `ssh-agent -s`
ssh-add deploy_key
