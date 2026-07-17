@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo Abrindo o projeto no Android Studio...
if not exist android (
  echo A pasta android ainda nao existe.
  echo Rode 01_INSTALAR_E_PREPARAR_ANDROID.bat primeiro.
  pause
  exit /b 1
)

call npx cap sync android
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\patch-android.ps1"
call npx cap open android

pause
