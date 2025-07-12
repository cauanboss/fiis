#!/bin/bash

# Script de desenvolvimento para FII Analyzer

echo "🚀 FII Analyzer - Script de Desenvolvimento"
echo "=============================================="

case "$1" in
  "start")
    echo "📦 Iniciando serviços com Docker Compose..."
    docker-compose up -d
    echo "✅ Serviços iniciados!"
    echo "🌐 Interface Web: http://localhost:3000"
    echo "🗄️  MongoDB Express: http://localhost:8081"
    ;;
  
  "stop")
    echo "🛑 Parando serviços..."
    docker-compose down
    echo "✅ Serviços parados!"
    ;;
  
  "restart")
    echo "🔄 Reiniciando serviços..."
    docker-compose restart
    echo "✅ Serviços reiniciados!"
    ;;
  
  "logs")
    echo "📋 Visualizando logs..."
    docker-compose logs -f
    ;;
  
  "build")
    echo "🔨 Reconstruindo imagem..."
    docker-compose build --no-cache
    echo "✅ Imagem reconstruída!"
    ;;
  
  "clean")
    echo "🧹 Limpando containers e volumes..."
    docker-compose down -v
    docker system prune -f
    echo "✅ Limpeza concluída!"
    ;;
  
  "shell")
    echo "🐚 Acessando shell do container..."
    docker-compose exec fii-analyzer-app /bin/bash
    ;;
  
  "mongo")
    echo "🗄️  Acessando MongoDB..."
    docker-compose exec mongodb mongosh -u admin -p fii_password
    ;;
  
  "backup")
    echo "💾 Criando backup do banco..."
    docker-compose exec mongodb mongodump --out /data/backup --db fii_analyzer
    docker cp fii-mongodb:/data/backup ./backup
    echo "✅ Backup criado em ./backup"
    ;;
  
  "restore")
    if [ -z "$2" ]; then
      echo "❌ Especifique o arquivo de backup: ./scripts/dev.sh restore <arquivo>"
      exit 1
    fi
    echo "📥 Restaurando backup..."
    docker cp "$2" fii-mongodb:/data/restore
    docker-compose exec mongodb mongorestore /data/restore
    echo "✅ Backup restaurado!"
    ;;
  
  *)
    echo "📖 Uso: ./scripts/dev.sh <comando>"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start     - Inicia todos os serviços"
    echo "  stop      - Para todos os serviços"
    echo "  restart   - Reinicia todos os serviços"
    echo "  logs      - Visualiza logs em tempo real"
    echo "  build     - Reconstrói as imagens"
    echo "  clean     - Limpa containers e volumes"
    echo "  shell     - Acessa shell do container da aplicação"
    echo "  mongo     - Acessa shell do MongoDB"
    echo "  backup    - Cria backup do banco"
    echo "  restore   - Restaura backup do banco"
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/dev.sh start"
    echo "  ./scripts/dev.sh logs"
    echo "  ./scripts/dev.sh backup"
    ;;
esac 