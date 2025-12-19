# Script para configurar nuevo proyecto Firebase
# Uso: .\setup-firebase.ps1

Write-Host "=== Configuración de Firebase Hosting ===" -ForegroundColor Cyan
Write-Host ""

# Listar proyectos existentes
Write-Host "Tus proyectos Firebase existentes:" -ForegroundColor Yellow
firebase projects:list

Write-Host ""
Write-Host "Opciones:" -ForegroundColor Green
Write-Host "1. Usar un proyecto existente"
Write-Host "2. Crear un nuevo proyecto"
Write-Host ""

$opcion = Read-Host "Selecciona una opción (1 o 2)"

if ($opcion -eq "1") {
    Write-Host ""
    Write-Host "Proyectos disponibles:" -ForegroundColor Yellow
    firebase projects:list
    Write-Host ""
    $projectId = Read-Host "Ingresa el Project ID del proyecto que quieres usar"
    firebase use --add $projectId
} elseif ($opcion -eq "2") {
    Write-Host ""
    $projectName = Read-Host "Ingresa el nombre para el nuevo proyecto (debe ser único)"
    Write-Host "Creando proyecto..." -ForegroundColor Yellow
    firebase projects:create $projectName
    Write-Host ""
    Write-Host "Inicializando Hosting..." -ForegroundColor Yellow
    firebase init hosting --project $projectName
} else {
    Write-Host "Opción inválida" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Configuración completada ===" -ForegroundColor Green
Write-Host ""
Write-Host "Para desplegar, ejecuta:" -ForegroundColor Cyan
Write-Host "npm run deploy:hosting" -ForegroundColor Yellow

