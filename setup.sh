#!/bin/bash

# Script di setup per Turni Coinquilini
# Questo script automatizza l'installazione e la configurazione del progetto

set -e  # Exit on error

echo "🚀 Setup Turni Coinquilini - Expo 54"
echo "======================================"
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Controlla prerequisiti
echo "📋 Controllo prerequisiti..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js non installato. Installa Node.js 18+ da https://nodejs.org"
    exit 1
fi
print_success "Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm non trovato"
    exit 1
fi
print_success "npm $(npm --version)"

# Check Expo CLI
if ! command -v expo &> /dev/null; then
    print_info "Expo CLI non trovato. Installazione in corso..."
    npm install -g expo-cli
fi
print_success "Expo CLI installato"

echo ""
echo "🧹 Pulizia progetto..."

# Rimuovi vecchie dipendenze
if [ -d "node_modules" ]; then
    print_info "Rimozione node_modules..."
    rm -rf node_modules
    print_success "node_modules rimosso"
fi

if [ -f "package-lock.json" ]; then
    rm package-lock.json
    print_success "package-lock.json rimosso"
fi

if [ -f "yarn.lock" ]; then
    rm yarn.lock
    print_success "yarn.lock rimosso"
fi

if [ -d ".expo" ]; then
    rm -rf .expo
    print_success "Cache .expo rimossa"
fi

echo ""
echo "📦 Installazione dipendenze..."

# Installa dipendenze
npm install

if [ $? -eq 0 ]; then
    print_success "Dipendenze installate con successo"
else
    print_error "Errore durante l'installazione delle dipendenze"
    exit 1
fi

echo ""
echo "🍎 Setup iOS..."

# Setup iOS (solo su Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v pod &> /dev/null; then
        print_info "Installazione CocoaPods..."
        cd ios
        pod install
        cd ..
        print_success "CocoaPods installato"
    else
        print_info "CocoaPods non trovato. Installa con: sudo gem install cocoapods"
    fi
else
    print_info "Sistema non-Mac, skip setup iOS"
fi

echo ""
echo "🔧 Configurazione API..."

# Controlla se api.ts esiste
if [ -f "src/services/api.ts" ]; then
    print_info "Ricorda di configurare l'URL API in src/services/api.ts"
    print_info "Modifica: const API_URL = 'http://TUO_IP:3000/api';"
else
    print_error "File api.ts non trovato"
fi

echo ""
echo "🧪 Verifica TypeScript..."

# Verifica TypeScript
npx tsc --noEmit

if [ $? -eq 0 ]; then
    print_success "Nessun errore TypeScript"
else
    print_error "Errori TypeScript trovati (controllare output sopra)"
fi

echo ""
echo "✨ Setup completato!"
echo ""
echo "📱 Comandi disponibili:"
echo "  npm start         - Avvia development server"
echo "  npm run android   - Avvia su Android"
echo "  npm run ios       - Avvia su iOS"
echo "  npm run web       - Avvia su Web"
echo ""
echo "📖 Per maggiori informazioni, leggi README.md"
echo ""

# Chiedi se avviare il server
read -p "Vuoi avviare il development server ora? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Avvio del server..."
    npm start
fi