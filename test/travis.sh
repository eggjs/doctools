#! /usr/bin/env bash

# Get the deploy key by using Travis's stored variables to decrypt deploy_key.enc
ENCRYPTED_KEY_VAR="encrypted_a62186272189_key"
ENCRYPTED_IV_VAR="encrypted_a62186272189_iv"
ENCRYPTED_KEY=${!ENCRYPTED_KEY_VAR}
ENCRYPTED_IV=${!ENCRYPTED_IV_VAR}
# echo "key: $ENCRYPTED_KEY, iv: $ENCRYPTED_IV"
openssl aes-256-cbc -K $encrypted_a599f9128306_key -iv $encrypted_a599f9128306_iv -in test/deploy_key.enc -out deploy_key -d
chmod 600 deploy_key
eval `ssh-agent -s`
ssh-add deploy_key
