# Script de configuration du backend AppResto
Write-Host "Configuration du backend AppResto" -ForegroundColor Green

# Copier .env.example vers .env si .env n'existe pas
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Fichier .env cree a partir de .env.example" -ForegroundColor Yellow
    Write-Host "Modifiez .env avec vos identifiants Firebase!" -ForegroundColor Yellow
} else {
    Write-Host "Le fichier .env existe deja" -ForegroundColor Green
}

# Installer les dependances
Write-Host "Installation des dependances..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Green
Write-Host "1. Ouvrez .env et remplissez FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_STORAGE_BUCKET"
Write-Host "2. Lancez le serveur: npm run dev"
Write-Host ""
