# Guía de Despliegue a Firebase Hosting

## Configuración Completada ✅

- ✅ Firebase CLI instalado (versión 14.9.0)
- ✅ Firebase configurado (proyecto: `clinica-44145`)
- ✅ `firebase.json` actualizado para apuntar a `dist/clinicaSofi/browser`
- ✅ Scripts de deploy agregados a `package.json`

## Pasos para Desplegar

### Opción 1: Usar el script automatizado (Recomendado)

```bash
npm run deploy:hosting
```

Este comando:
1. Construye la aplicación en modo producción
2. Despliega automáticamente a Firebase Hosting

### Opción 2: Pasos manuales

1. **Construir la aplicación para producción:**
   ```bash
   ng build --configuration production
   ```
   O alternativamente:
   ```bash
   npm run build:prod
   ```

2. **Verificar que los archivos se generaron:**
   Los archivos deben estar en: `dist/clinicaSofi/browser/`

3. **Desplegar a Firebase:**
   ```bash
   firebase deploy --only hosting
   ```

4. **O desplegar todo (si tienes otros servicios de Firebase):**
   ```bash
   firebase deploy
   ```

## Verificar el Despliegue

Después del deploy, Firebase te dará una URL como:
- `https://clinica-44145.web.app`
- `https://clinica-44145.firebaseapp.com`

## Comandos Útiles

- **Ver el estado del proyecto Firebase:**
  ```bash
  firebase projects:list
  ```

- **Ver la configuración actual:**
  ```bash
  firebase use
  ```

- **Previsualizar localmente antes de desplegar:**
  ```bash
  firebase serve
  ```

## Notas Importantes

⚠️ **Asegúrate de que:**
- Las variables de entorno de Supabase estén configuradas correctamente
- Los archivos de assets estén incluidos en el build
- El archivo `firebase.json` apunte al directorio correcto (`dist/clinicaSofi/browser`)

## Solución de Problemas

Si encuentras errores:

1. **Error de autenticación:**
   ```bash
   firebase login
   ```

2. **Error de proyecto:**
   ```bash
   firebase use clinica-44145
   ```

3. **Limpiar y reconstruir:**
   ```bash
   rm -rf dist
   ng build --configuration production
   firebase deploy --only hosting
   ```

