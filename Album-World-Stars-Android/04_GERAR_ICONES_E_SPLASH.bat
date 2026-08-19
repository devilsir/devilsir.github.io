@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo Gerando icones/splash Android a partir da pasta resources...
where npm >nul 2>nul
if errorlevel 1 (
  echo Rode 01_INSTALAR_E_PREPARAR_ANDROID.bat primeiro.
  pause
  exit /b 1
)

call npm run icons
call npx cap sync android
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\patch-android.ps1"

echo Pronto.
pause
