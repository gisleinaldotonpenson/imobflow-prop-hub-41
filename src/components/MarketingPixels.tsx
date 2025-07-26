import { useEffect } from 'react';
import { useMarketingSettings } from '@/hooks/useMarketingSettings';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function MarketingPixels() {
  const { settings } = useMarketingSettings();

  useEffect(() => {
    // Load Facebook Pixel
    if (settings?.facebook_pixel_id) {
      const pixelId = settings.facebook_pixel_id;
      
      // Check if Facebook Pixel script is already loaded
      if (!window.fbq) {
        const script = document.createElement('script');
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
        `;
        document.head.appendChild(script);
      }

      // Initialize Facebook Pixel
      if (window.fbq) {
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
      }
    }
  }, [settings?.facebook_pixel_id]);

  useEffect(() => {
    // Load Google Analytics
    if (settings?.google_analytics_id) {
      const gaId = settings.google_analytics_id;
      
      // Check if Google Analytics script is already loaded
      const existingScript = document.querySelector(`script[src*="${gaId}"]`);
      if (!existingScript) {
        // Load Google Analytics script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        // Initialize Google Analytics
        const configScript = document.createElement('script');
        configScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `;
        document.head.appendChild(configScript);
      }
    }
  }, [settings?.google_analytics_id]);

  useEffect(() => {
    // Load Google Tag Manager
    if (settings?.google_tag_manager_id) {
      const gtmId = settings.google_tag_manager_id;
      
      // Check if GTM script is already loaded
      const existingScript = document.querySelector(`script[src*="${gtmId}"]`);
      if (!existingScript) {
        // GTM Head Script
        const headScript = document.createElement('script');
        headScript.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `;
        document.head.appendChild(headScript);

        // GTM Body Script (noscript)
        const noscript = document.createElement('noscript');
        noscript.innerHTML = `
          <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
        `;
        document.body.appendChild(noscript);
      }
    }
  }, [settings?.google_tag_manager_id]);

  // This component doesn't render anything visible
  return null;
}