# Getting started

Clone the project

First time running navigate to `docker` folder in terminal and do `docker compose up`

For Development you can use `. messenger-dev.sh` that starts the app and opens up terminals for app and api then do `npm start` for each.

# Chat App with End-to-End Encryption

## Overview

This Chat App is a secure messaging platform with end-to-end encryption, ensuring privacy and security in communication.

## Features

- **End-to-End Encryption:** Messages are encrypted using a combination of symmetric and asymmetric encryption, ensuring that only the intended recipients can decrypt them.
- **Public/Private Key Generation:** Users generate their own key pairs using the Web Cryptography API, with private keys securely stored on their device.
- **Secure Key Exchange:** Public keys are shared and stored on a server, allowing users to encrypt messages for each other.

## Technologies

- React
- Node.js
- MongoDB
- Web Cryptography API

## Dependency

- Docker

## Getting Started

- Clone the project

### First time running

- navigate to `docker` folder in terminal and do `docker compose up`
- in new terminal open docker container for api `docker exec -it docker-mesenger-backend-api-1 bash`
- in new terminal open docker container for app `docker exec -it docker-mesenger-client-app-1 bash`

#### For both app and api

- Install Dependencies: Run npm install to install required packages.
- create `.env` file and copy contents of `.env.example`, populate as needed.
- do `npm start`

## Development

On Ubuntu you can use `. messenger-dev.sh` that starts the app and opens up terminals for app and api then do `npm start` for each.

## Usage

Send a Message: Encrypt the message using the recipient's public key.

Receive a Message: Decrypt the message using your private key.

For detailed implementation of each feature, refer to the respective component documentation in the codebase.
