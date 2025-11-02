# 🏠 Turni Coinquilini - App React Native

Un'applicazione moderna e completa per gestire i turni domestici tra coinquilini, con un'interfaccia utente elegante e professionale.

## ✨ Caratteristiche Principali

- 🎨 **Design Moderno**: UI/UX curata con animazioni fluide e componenti riutilizzabili
- 📱 **Responsive**: Funziona perfettamente su iOS e Android
- 🔐 **Autenticazione Completa**: Sistema di login/registrazione sicuro con JWT
- 📅 **Calendario Interattivo**: Visualizza e gestisci i turni con un calendario integrato
- 📊 **Statistiche Dettagliate**: Monitora le performance di ogni coinquilino
- 🏆 **Sistema di Punteggi**: Classifica gamificata per motivare i coinquilini
- 🔔 **Notifiche**: Sistema di notifiche per reminder e aggiornamenti
- 🎯 **Gestione Case Multiple**: Supporto per più case e gruppi

## 🏗️ Architettura

```
src/
├── contexts/          # Context API per state management
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── navigation/        # Stack e Tab navigators
│   ├── AuthNavigator.tsx
│   └── MainNavigator.tsx
├── screens/          # Schermate dell'app
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── HomeScreen.tsx
│   ├── ShiftsScreen.tsx
│   ├── StatsScreen.tsx
│   └── SettingsScreen.tsx
└── services/         # API e servizi
    └── api.ts
```

## 🚀 Setup e Installazione

### Prerequisiti

- Node.js (v16 o superiore)
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Un emulatore Android/iOS o un dispositivo fisico con Expo Go

### Installazione

1. **Clona il repository o copia i file**

2. **Installa le dipendenze**
```bash
npm install
```

3. **Configura l'URL del backend**
    - Apri `src/services/api.ts`
    - Modifica `API_URL` con l'indirizzo IP del tuo backend:
   ```typescript
   const API_URL = 'http://TUO_IP:3000/api';
   ```
    - **Nota**: Se usi l'emulatore Android, usa `10.0.2.2` invece di `localhost`

4. **Avvia l'app**
```bash
npm start
# oppure
expo start
```

5. **Scegli la piattaforma**
    - Premi `a` per Android
    - Premi `i` per iOS
    - Scansiona il QR code con Expo Go su dispositivo fisico

## 📱 Schermate Principali

### 1. Login/Register
- Design elegante con icone e animazioni
- Validazione in tempo reale
- Toggle password visibility
- Error handling completo

### 2. Home
- Calendario interattivo per selezione date
- Lista turni giornalieri
- Badge colorati per status turni
- Pull-to-refresh

### 3. Turni
- Visualizzazione completa di tutti i turni
- Filtri: Tutti, I miei, In attesa, Completati
- Modal dettaglio con azioni rapide
- Possibilità di completare/riassegnare turni

### 4. Statistiche
- Overview casa con metriche principali
- Classifica coinquilini con medaglie
- Sistema punti e percentuale completamento
- Indicatore per l'utente corrente

### 5. Impostazioni
- Gestione profilo utente
- Lista case con codici invito
- Crea/Unisciti a case
- Logout sicuro

## 🎨 Design System

### Colori
```typescript
primary: '#6366F1'    // Indigo
secondary: '#8B5CF6'  // Purple
accent: '#EC4899'     // Pink
success: '#10B981'    // Green
error: '#EF4444'      // Red
warning: '#F59E0B'    // Amber
```

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

### Border Radius
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px

## 🔧 Tecnologie Utilizzate

- **React Native** - Framework mobile
- **TypeScript** - Type safety
- **Expo** - Development platform
- **React Navigation** - Navigazione
- **Context API** - State management
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **react-native-calendar-picker** - Calendario
- **react-native-modal** - Modali eleganti
- **@expo/vector-icons** - Icone

## 🔐 Sicurezza

- JWT tokens per autenticazione
- AsyncStorage sicuro per credenziali
- Validazione input lato client
- Error handling robusto
- Timeout richieste HTTP

## 📦 Dipendenze Principali

```json
{
  "react": "18.2.0",
  "react-native": "0.72.6",
  "expo": "~49.0.15",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/native-stack": "^6.9.17",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "axios": "^1.6.2",
  "date-fns": "^2.30.0",
  "react-native-calendar-picker": "^7.1.3",
  "react-native-modal": "^13.0.1"
}
```

## 🐛 Troubleshooting

### Errore di connessione al backend
- Verifica che il backend sia avviato sulla porta 3000
- Controlla che l'IP in `api.ts` sia corretto
- Assicurati di essere sulla stessa rete WiFi (se usi dispositivo fisico)
- Per Android emulator usa `10.0.2.2` invece di `localhost`

### Errori di build
```bash
# Pulisci cache
expo start -c

# Reinstalla dipendenze
rm -rf node_modules
npm install
```

### Problemi con le icone
```bash
# Assicurati che Expo sia aggiornato
expo upgrade
```

## 🚀 Build per Produzione

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

### EAS Build (consigliato)
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## 📝 TODO / Miglioramenti Futuri

- [ ] Notifiche push native
- [ ] Dark mode
- [ ] Internazionalizzazione (i18n)
- [ ] Offline mode con sync
- [ ] Foto profilo upload
- [ ] Chat tra coinquilini
- [ ] Calendario condiviso eventi
- [ ] Lista spesa condivisa
- [ ] Export statistiche PDF
