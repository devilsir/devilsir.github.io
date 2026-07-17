$ErrorActionPreference = "Stop"

# Escrita UTF-8 SEM BOM. O BOM no Java causa erro: illegal character: '\ufeff'.
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$rootDir = Join-Path $PSScriptRoot ".."

$manifestPath = Join-Path $rootDir "android\app\src\main\AndroidManifest.xml"
if (!(Test-Path $manifestPath)) {
  Write-Host "AndroidManifest.xml ainda não existe. Rode o script 01 primeiro." -ForegroundColor Yellow
  exit 0
}

$content = [System.IO.File]::ReadAllText($manifestPath, [System.Text.Encoding]::UTF8)
$nl = [Environment]::NewLine

if ($content -notmatch 'android.permission.CAMERA') {
  $replacement = "<manifest`$1>$nl    <uses-permission android:name=`"android.permission.CAMERA`" />$nl    <uses-feature android:name=`"android.hardware.camera`" android:required=`"false`" />"
  $content = $content -replace '<manifest([^>]*)>', $replacement
}

# Mantém a WebView mais tranquila para arquivos locais/offline e debugging de protótipo.
if ($content -notmatch 'android:usesCleartextTraffic') {
  $content = $content -replace '<application ', '<application android:usesCleartextTraffic="true" '
}

[System.IO.File]::WriteAllText($manifestPath, $content, $utf8NoBom)
Write-Host "Permissões/configurações Android conferidas." -ForegroundColor Green

# Reforça fullscreen também no tema de launch/splash. Isso esconde a barra de status já na abertura do app.
function Add-FullscreenItemsToStyle($stylesContent, $styleName) {
  $items = @"
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:windowDrawsSystemBarBackgrounds">true</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
"@
  $pattern = "(?s)(<style\s+name=`"$styleName`"[^>]*>)(.*?)(</style>)"
  return [regex]::Replace($stylesContent, $pattern, {
    param($m)
    $body = $m.Groups[2].Value
    if ($body -match 'android:windowFullscreen') {
      return $m.Value
    }
    return $m.Groups[1].Value + $body + $items + $m.Groups[3].Value
  }, 1)
}

$resDir = Join-Path $rootDir "android\app\src\main\res"
if (Test-Path $resDir) {
  $styleFiles = Get-ChildItem -Path $resDir -Recurse -Filter "styles.xml" -ErrorAction SilentlyContinue
  foreach ($styleFile in $styleFiles) {
    $styles = [System.IO.File]::ReadAllText($styleFile.FullName, [System.Text.Encoding]::UTF8)
    $styles = Add-FullscreenItemsToStyle $styles "AppTheme"
    $styles = Add-FullscreenItemsToStyle $styles "AppTheme.NoActionBar"
    $styles = Add-FullscreenItemsToStyle $styles "AppTheme.NoActionBarLaunch"
    [System.IO.File]::WriteAllText($styleFile.FullName, $styles, $utf8NoBom)
  }
  Write-Host "Tema Android configurado para fullscreen no splash e no app." -ForegroundColor Green
}

# Força modo tela cheia/imersivo no Android: esconde barra de status (hora/bateria) e barra inferior.
$mainActivityDir = Join-Path $rootDir "android\app\src\main\java\com\timbo\worldstarsalbum"
$mainActivityPath = Join-Path $mainActivityDir "MainActivity.java"

if (Test-Path $mainActivityDir) {
  $mainActivity = @'
package com.timbo.worldstarsalbum;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    requestWindowFeature(Window.FEATURE_NO_TITLE);
    getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
    super.onCreate(savedInstanceState);
    enableImmersiveFullscreen();
  }

  @Override
  public void onResume() {
    super.onResume();
    enableImmersiveFullscreen();
  }

  @Override
  public void onPause() {
    pauseAlbumMusicInWebView();
    super.onPause();
  }

  @Override
  public void onStop() {
    pauseAlbumMusicInWebView();
    super.onStop();
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) {
      enableImmersiveFullscreen();
    }
  }

  private void pauseAlbumMusicInWebView() {
    try {
      final android.webkit.WebView webView = getBridge() != null ? getBridge().getWebView() : null;
      if (webView != null) {
        webView.post(new Runnable() {
          @Override
          public void run() {
            webView.evaluateJavascript("window.__pauseAlbumMusic && window.__pauseAlbumMusic();", null);
          }
        });
      }
    } catch (Exception ignored) {
      // Mantém o app estável mesmo se a WebView ainda não estiver pronta.
    }
  }

  private void enableImmersiveFullscreen() {
    Window window = getWindow();
    window.setStatusBarColor(Color.TRANSPARENT);
    window.setNavigationBarColor(Color.TRANSPARENT);
    window.setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

    View decorView = window.getDecorView();
    decorView.setSystemUiVisibility(
      View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
      | View.SYSTEM_UI_FLAG_FULLSCREEN
      | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
      | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
      | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
      | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
    );

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      window.setDecorFitsSystemWindows(false);
      WindowInsetsController controller = window.getInsetsController();
      if (controller != null) {
        controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
        controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
      }
    }
  }
}
'@

  # Muito importante: Java precisa ser salvo sem BOM.
  [System.IO.File]::WriteAllText($mainActivityPath, $mainActivity, $utf8NoBom)
  Write-Host "MainActivity em fullscreen real aplicado sem BOM." -ForegroundColor Green
} else {
  Write-Host "Pasta do MainActivity ainda não existe. Rode cap add/sync e execute o patch novamente." -ForegroundColor Yellow
}
