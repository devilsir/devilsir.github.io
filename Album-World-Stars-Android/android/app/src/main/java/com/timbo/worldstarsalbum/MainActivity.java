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
      // MantÃ©m o app estÃ¡vel mesmo se a WebView ainda nÃ£o estiver pronta.
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