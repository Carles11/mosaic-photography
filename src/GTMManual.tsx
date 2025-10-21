/**
 * Google Tag Manager Loader
 * - Injects Consent Mode and GTM script only if consent is granted
 * - Place this component in your layout, conditionally rendered
 * - GTM container ID: GTM-N74Q9JC5
 */

import React from "react";

type Props = {
  consentGranted: boolean;
};

export default function GTMManual({ consentGranted }: Props) {
  // Only render scripts if consent is granted
  if (!consentGranted) return null;

  return (
    <>
      {/* Set Consent Mode before GTM loads */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage: 'granted'
            });
          `,
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N74Q9JC5');`,
        }}
      />
    </>
  );
}