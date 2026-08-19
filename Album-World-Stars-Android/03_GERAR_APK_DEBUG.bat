@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo Gerando APK debug...
if not exist android (
  echo A pasta android ainda nao existe.
  echo Rode 01_INSTALAR_E_PREPARAR_ANDROID.bat primeiro.
  pause
  exit /b 1
)

call npx cap sync android
if errorlevel 1 (
  echo Falha no cap sync.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\patch-android.ps1"

cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
  echo.
  echo Nao consegui gerar o APK pelo terminal.
  echo Abra o Android Studio uma vez, deixe ele instalar o SDK/Gradle, e tente novamente.
  echo Tambem da para gerar por: Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
  pause
  exit /b 1
)

cd ..
echo.
echo ============================================================
echo APK gerado em:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo ============================================================
echo.
start "" "%~dp0android\app\build\outputs\apk\debug"
pause
