import "@/css/satoshi.css";
import "@/css/style.css";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Sistema Político - Campanha Inteligente",
    default: "Sistema Político - Campanha Inteligente",
  },
  description:
    "Painel administrativo completo para gestão de campanhas políticas inteligentes com IA, análises e comunicação multicanal.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader color="#7B2CBF" showSpinner={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
