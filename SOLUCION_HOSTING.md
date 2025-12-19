# Solución: Página de Bienvenida de Firebase

Si ves la página de bienvenida de Firebase en lugar de tu aplicación, sigue estos pasos:

## Paso 1: Limpiar Caché del Navegador

1. Presiona `Ctrl + Shift + Delete` en Chrome
2. Selecciona "Imágenes y archivos en caché"
3. Haz clic en "Borrar datos"
4. Recarga la página con `Ctrl + F5` (forzar recarga)

## Paso 2: Verificar en Firebase Console

1. Ve a: https://console.firebase.google.com/project/clinica-44145/hosting
2. Verifica que el sitio esté configurado correctamente
3. Si hay múltiples sitios, asegúrate de que el correcto esté seleccionado

## Paso 3: Verificar la Configuración de Hosting

En Firebase Console:
1. Ve a **Hosting** → **Configuración**
2. Verifica que el directorio público sea: `dist/clinicaSofi/browser`
3. Verifica que las reglas de rewrite estén configuradas:
   - Source: `**`
   - Destination: `/index.html`

## Paso 4: Si el Problema Persiste

Si después de limpiar la caché sigues viendo la página de bienvenida:

1. **Eliminar y recrear el sitio de hosting:**
   - Ve a Firebase Console → Hosting
   - Elimina el sitio actual (si es posible)
   - Crea un nuevo sitio o reconfigura el existente

2. **Verificar que los archivos se desplegaron:**
   ```bash
   firebase hosting:channel:list
   ```

3. **Redesplegar forzando:**
   ```bash
   firebase deploy --only hosting --force
   ```

## Paso 5: Verificar el Archivo index.html

Asegúrate de que el archivo `dist/clinicaSofi/browser/index.html` contenga:
- `<app-root></app-root>`
- Las referencias correctas a los archivos JS y CSS

## Nota sobre Caché de Firebase

Firebase puede tardar unos minutos en propagar los cambios. Espera 2-3 minutos y vuelve a intentar.

## Alternativa: Usar el Proyecto clinicamr-6f717

Si prefieres usar el proyecto `clinicamr-6f717`:

1. Cambiar el proyecto:
   ```bash
   firebase use clinicamr-6f717
   ```

2. Asegurarse de que Hosting esté habilitado en ese proyecto

3. Redesplegar:
   ```bash
   firebase deploy --only hosting
   ```

