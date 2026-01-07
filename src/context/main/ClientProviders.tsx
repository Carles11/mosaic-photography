"use client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AgeConsentProvider } from "@/context/AgeConsentContext";
import { ServiceWorkerContext } from "@/context/ServiceWorkerContext";
import { AuthSessionProvider } from "@/context/AuthSessionContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CommentsProvider } from "@/context/CommentsContext";
import { FiltersProvider } from "@/context/settingsContext/filters";
import ModalProviderLoader from "@/components/modals/ModalProviderLoader";
import CookieConsentBanner from "@/components/cookieConsent/CookieConsentBanner";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster position="top-center" />
      <ThemeProvider defaultTheme="dark">
        <ServiceWorkerContext>
          <AuthSessionProvider>
            <AgeConsentProvider>
              <FavoritesProvider>
                <CommentsProvider>
                  <FiltersProvider>
                    {/* Portal root for modals must exist before the ModalProvider mounts */}
                    <div id="modal-root" />
                    <div id="modal-loader-root">
                      {/* ModalProviderLoader mounts the client ModalProvider lazily */}
                    </div>
                    <ModalProviderLoader>{children}</ModalProviderLoader>
                    <CookieConsentBanner />
                  </FiltersProvider>
                </CommentsProvider>
              </FavoritesProvider>
            </AgeConsentProvider>
          </AuthSessionProvider>
        </ServiceWorkerContext>
      </ThemeProvider>
    </>
  );
}
