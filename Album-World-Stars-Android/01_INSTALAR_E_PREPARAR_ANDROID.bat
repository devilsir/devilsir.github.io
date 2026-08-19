@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"

echo.
echo ============================================================
echo  WORLD STARS ALBUM - INSTALAR E PREPARAR ANDROID
echo ============================================================
echo.

echo Este script tenta instalar Node.js, JDK 17 e Android Studio via winget.
echo Se o Windows pedir permissao, aceite.
echo.

where winget >nul 2>nul
if %errorlevel%==0 (
  echo [1/6] Instalando/atualizando Node.js LTS...
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  echo.
  echo [2/6] Instalando/atualizando JDK 17...
  winget install -e --id EclipseAdoptium.Temurin.17.JDK --accept-package-agreements --accept-source-agreements
  echo.
  echo [3/6] Instalando/atualizando Android Studio...
  winget install -e --id Google.AndroidStudio --accept-package-agreements --accept-source-agreements
) else (
  echo Winget nao foi encontrado neste Windows.
  echo Instale manualmente: Node.js LTS, Android Studio e JDK 17.
  echo Depois rode este BAT de novo.
  pause
  exit /b 1
)

echo.
echo [4/6] Conferindo NPM...
where npm >nul 2>nul
if errorlevel 1 (
  echo NPM ainda nao foi encontrado no PATH.
  echo Feche este terminal, abra de novo e rode este BAT novamente.
  pause
  exit /b 1
)

echo.
echo [5/6] Instalando dependencias do projeto Capacitor...
call npm install
if errorlevel 1 (
  echo Falha no npm install. Confira sua internet e tente novamente.
  pause
  exit /b 1
)

echo.
echo [6/6] Criando/sincronizando projeto Android...
if not exist android (
  call npx cap add android
  if errorlevel 1 (
    echo Falha ao criar o projeto Android.
    pause
    exit /b 1
  )
)

call npx cap sync android
if errorlevel 1 (
  echo Falha ao sincronizar o Android.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\patch-android.ps1"

echo.
echo ============================================================
echo  PRONTO. Agora rode 02_ABRIR_ANDROID_STUDIO.bat
echo  ou 03_GERAR_APK_DEBUG.bat.
echo ============================================================
echo.
pause
