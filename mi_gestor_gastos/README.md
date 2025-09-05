# Gestor de Gastos Personales

Una aplicación web para gestionar tus finanzas personales built con Node.js, Express y EJS.

## Características

- ✅ Registro de ingresos y gastos
- ✅ Categorías personalizables
- ✅ Gráficos y estadísticas
- ✅ Sistema de presupuestos
- ✅ Exportación a CSV
- ✅ Filtros avanzados
- ✅ Dashboard interactivo

## Despliegue en Railway

### Método 1: Desde GitHub
1. Haz fork de este repositorio
2. Conecta tu cuenta de GitHub con Railway
3. Selecciona el repositorio para desplegar
4. ¡Listo! Railway detectará automáticamente la configuración

### Método 2: Desde CLI
```bash
# Instala Railway CLI
npm install -g @railway/cli

# Inicia sesión
railway login

# Despliega
railway init
railway deploy

Variables de Entorno
Variable	Descripción	Valor por defecto
PORT	Puerto del servidor	3000
NODE_ENV	Entorno de ejecución	development
Desarrollo Local
bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
Tecnologías Utilizadas
Backend: Node.js, Express.js

Frontend: EJS, CSS3, JavaScript

Base de datos: JSON (archivo)

Gráficos: Chart.js

Iconos: Font Awesome

Deployment: Railway

text

## Paso 6: Desplegar en Railway

### 6.1 Desde la Web de Railway (Recomendado)
1. **Ve a** [railway.app](https://railway.app) y crea una cuenta
2. **Haz click** en "New Project" → "Deploy from GitHub repo"
3. **Conecta** tu cuenta de GitHub
4. **Selecciona** tu repositorio del gestor de gastos
5. **Railway detectará** automáticamente que es una app Node.js
6. **¡Despliegue automático!** 🚀

### 6.2 Desde CLI de Railway
```bash
# Instalar CLI de Railway
npm install -g @railway/cli

# Iniciar sesión
railway login

# Inicializar proyecto
railway init

# Desplegar
railway deploy
Paso 7: Verificar el despliegue
Una vez desplegado:

Visita la URL que Railway te proporciona

Verifica que todas las funcionalidades funcionen

Prueba crear algunas transacciones

Comprueba que los gráficos se muestren correctamente

Solución de problemas comunes
Si hay errores en producción:
Revisa los logs en el dashboard de Railway

Verifica que todas las variables de entorno estén configuradas

Asegúrate de que el puerto esté configurado correctamente (Railway asigna uno automáticamente)

Para actualizar la aplicación:
Haz push a tu repositorio de GitHub

Railway detectará los cambios y redeplegará automáticamente

¡Y listo! 🎉
Tu gestor de gastos estará vivo en internet con:

✅ URL pública accesible desde cualquier dispositivo

✅ Despliegue automático con cada cambio en GitHub

✅ Escalabilidad automática

✅ SSL gratuito (HTTPS)

✅ Backups automáticos