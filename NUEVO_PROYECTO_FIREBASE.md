# Guía: Crear Nuevo Proyecto Firebase y Desplegar

## Opción 1: Crear Proyecto desde Firebase Console (Recomendado)

### Paso 1: Crear el Proyecto en Firebase Console
1. Ve a: https://console.firebase.google.com/
2. Haz clic en "Agregar proyecto" o "Crear un proyecto"
3. Ingresa un nombre para tu proyecto (ej: `clinica-mr` o `clinica-sofi-nuevo`)
4. Sigue los pasos del asistente:
   - Desactiva Google Analytics si no lo necesitas (o actívalo si quieres)
   - Haz clic en "Crear proyecto"
5. Espera a que se cree el proyecto

### Paso 2: Habilitar Firebase Hosting
1. En la consola de Firebase, ve a tu proyecto
2. En el menú lateral, haz clic en "Hosting"
3. Haz clic en "Comenzar" o "Get started"
4. Sigue las instrucciones básicas (puedes saltarlas si ya tienes Firebase CLI configurado)

### Paso 3: Obtener el ID del Proyecto
- El ID del proyecto aparece en la parte superior de la consola
- O en la configuración del proyecto (ícono de engranaje)
- Ejemplo: `clinica-mr-2024` o `clinica-sofi-nuevo`

## Opción 2: Crear Proyecto desde Firebase CLI

### Paso 1: Crear el Proyecto
```bash
firebase projects:create NOMBRE_DEL_PROYECTO
```
Reemplaza `NOMBRE_DEL_PROYECTO` con el nombre que quieras (debe ser único)

### Paso 2: Inicializar Firebase Hosting
```bash
firebase init hosting
```

## Paso 4: Configurar el Proyecto Local

Una vez que tengas el ID del proyecto, ejecuta:

```bash
firebase use --add
```

Esto te pedirá:
1. Seleccionar el proyecto de la lista (o ingresar el ID)
2. Darle un alias (puedes usar "default" o cualquier nombre)

## Paso 5: Verificar Configuración

El archivo `.firebaserc` se actualizará automáticamente con el nuevo proyecto.

## Paso 6: Desplegar

```bash
npm run deploy:hosting
```

O manualmente:
```bash
ng build --configuration production
firebase deploy --only hosting
```

## Notas Importantes

- El ID del proyecto debe ser único en Firebase
- Si el nombre que quieres ya existe, Firebase te sugerirá variaciones
- Puedes tener múltiples proyectos configurados usando aliases

