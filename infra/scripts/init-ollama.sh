#!/bin/bash

echo "Starting Ollama initialization..."

# Wait for Ollama service to be ready
until curl -s http://ollama:11434/api/tags > /dev/null; do
  echo "Waiting for Ollama to start..."
  sleep 5
done

echo "Ollama is ready. Pulling models..."

# Pull required models
ollama pull meditron
ollama pull llama3

echo "Models pulled successfully."
