#!/usr/bin/env bash
# exit on error
set -o errexit

# Use legacy-peer-deps to solve the Pinecone/LangChain conflict
npm install --legacy-peer-deps
npm run build