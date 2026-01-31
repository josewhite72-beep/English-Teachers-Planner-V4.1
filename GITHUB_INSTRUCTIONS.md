# 🐙 Instrucciones para Subir a tu GitHub

## Paso 1: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `english-teachers-planner` (o el que prefieras)
3. Descripción: "Aplicación web para generar planeamientos de inglés - Currículo MEDUCA Panamá"
4. **Importante:** NO inicialices con README, .gitignore ni licencia (ya los tenemos)
5. Clic en "Create repository"

## Paso 2: Conectar tu Repositorio

GitHub te mostrará una página con comandos. Usa estos:

```bash
cd /app
git remote add origin https://github.com/TU-USUARIO/english-teachers-planner.git
git branch -M main
git push -u origin main
```

**Reemplaza `TU-USUARIO`** con tu nombre de usuario de GitHub.

## Paso 3: Autenticación

Cuando te pida usuario/contraseña:

**Usuario:** tu-usuario-github
**Contraseña:** USA UN PERSONAL ACCESS TOKEN (no tu contraseña)

### Cómo crear un Personal Access Token:

1. Ve a: https://github.com/settings/tokens
2. Clic en "Generate new token" → "Generate new token (classic)"
3. Nombre: "Emergent App Upload"
4. Scopes: Marca ✅ `repo` (acceso completo a repositorios)
5. Clic en "Generate token"
6. **COPIA EL TOKEN** (solo se muestra una vez)
7. Úsalo como contraseña cuando hagas `git push`

## Paso 4: Verificar

Después del push, ve a tu repositorio en GitHub:
`https://github.com/TU-USUARIO/english-teachers-planner`

Deberías ver todos los archivos subidos.

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
cd /app
git add -A
git commit -m "Descripción de los cambios"
git push
```

## 🚀 Deploy desde GitHub

Una vez en GitHub, puedes deployer en:

**Frontend (Vercel):**
1. https://vercel.com/new
2. Import repository
3. Deploy

**Backend (Railway):**
1. https://railway.app/new
2. Deploy from GitHub repo
3. Add MongoDB
4. Configure variables

## 📝 Notas Importantes

- Los archivos `.env` NO se suben (están en .gitignore)
- Los datos curriculares SÍ se suben (son necesarios)
- El código queda privado (solo tú lo ves) a menos que lo hagas público
- Puedes invitar colaboradores desde GitHub

## ✅ Todo Listo

Tu código ahora está:
- ✅ Respaldado en la nube
- ✅ Con control de versiones
- ✅ Listo para colaboración
- ✅ Preparado para deploy externo
