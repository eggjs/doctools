#! /usr/bin/env bash

openssl aes-256-cbc -K $encrypted_28400b888db2_key -iv $encrypted_28400b888db2_iv -in test/deploy_key.enc -out deploy_key -d
chmod 600 deploy_key

echo "" >> ~/.ssh/config
echo "Host github.com" >> ~/.ssh/config
echo "  IdentityFile $PWD/deploy_key" >> ~/.ssh/config
echo "  LogLevel ERROR" >> ~/.ssh/config

cat ~/.ssh/config
