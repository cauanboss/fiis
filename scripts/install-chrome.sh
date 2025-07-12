#!/bin/bash

# Script para instalar Chrome para desenvolvimento local

echo "🔧 Instalando Chrome para desenvolvimento local..."

# Verificar se o Chrome já está instalado
if command -v google-chrome &> /dev/null; then
    echo "✅ Chrome já está instalado!"
    exit 0
fi

# Detectar o sistema operacional
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "🐧 Detectado Linux, instalando Chrome..."
    
    # Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        echo "📦 Instalando via apt-get..."
        wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
        sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
        sudo apt-get update
        sudo apt-get install -y google-chrome-stable
    else
        echo "❌ Sistema não suportado. Instale o Chrome manualmente."
        exit 1
    fi
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "🍎 Detectado macOS, instalando Chrome..."
    
    if command -v brew &> /dev/null; then
        echo "📦 Instalando via Homebrew..."
        brew install --cask google-chrome
    else
        echo "❌ Homebrew não encontrado. Instale o Chrome manualmente."
        exit 1
    fi
    
else
    echo "❌ Sistema operacional não suportado. Instale o Chrome manualmente."
    exit 1
fi

echo "✅ Chrome instalado com sucesso!"
echo "🚀 Agora você pode executar: bun run dev" 