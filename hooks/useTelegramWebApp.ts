import { useEffect, useState } from 'react';

declare global {
  interface TelegramThemeParams {
    bg_color?: string;
    secondary_bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  }

  interface TelegramViewport {
    height: number;
    width: number;
    isExpanded: boolean;
  }

  interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    close: () => void;
    colorScheme?: 'light' | 'dark';
    themeParams?: TelegramThemeParams;
    setHeaderColor?: (color: string) => void;
    setBackgroundColor?: (color: string) => void;
    viewport?: TelegramViewport;
    onEvent?: (event: string, handler: (...args: unknown[]) => void) => void;
    offEvent?: (event: string, handler: (...args: unknown[]) => void) => void;
  }

  interface TelegramNamespace {
    WebApp?: TelegramWebApp;
  }

  interface Window {
    Telegram?: TelegramNamespace;
  }
}

export function useTelegramWebApp(): TelegramWebApp | null {
  const [app, setApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const checkWebApp = () => {
      const webApp = window.Telegram?.WebApp;
      if (webApp) {
        try {
          webApp.ready();
          webApp.expand?.();
          setApp(webApp);
          return true; // found
        } catch (error) {
          console.warn('Telegram WebApp integration failed', error);
          return true; // stop trying
        }
      }
      return false; // not found
    };

    if (checkWebApp()) {
      return; // already there
    }

    const intervalId = setInterval(() => {
      if (checkWebApp()) {
        clearInterval(intervalId);
      }
    }, 100); // check every 100ms

    // cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return app;
}

export function useTelegramColorScheme(webApp: TelegramWebApp | null): 'light' | 'dark' | 'auto' {
  const [scheme, setScheme] = useState<'light' | 'dark' | 'auto'>(() => {
    if (!webApp?.colorScheme) {
      return 'auto';
    }
    return webApp.colorScheme;
  });

  useEffect(() => {
    if (!webApp?.onEvent || !webApp?.offEvent) {
      return;
    }

    const handler = () => {
      if (webApp?.colorScheme) {
        setScheme(webApp.colorScheme);
      }
    };

    webApp.onEvent('themeChanged', handler);
    return () => {
      webApp.offEvent?.('themeChanged', handler);
    };
  }, [webApp]);



  return scheme;
}