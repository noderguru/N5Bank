import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geologica, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routing, type Locale } from "@/i18n/routing";

import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

// Display tier. D-DIN has no Cyrillic coverage, and neither does any condensed
// DIN substitute on Google Fonts — Geologica is the closest industrial grotesk
// that ships uk/ru glyphs, which the three locales make non-negotiable.
const geologica = Geologica({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "N5Deal Marketplace",
  description: "A marketplace for M&A opportunities and financial assets.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const isDark = themeCookie === "dark";

  return (
    <html lang={locale} className={isDark ? "dark" : ""} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var cookies = document.cookie.split(';');
                  var cookieTheme = null;
                  for (var i = 0; i < cookies.length; i++) {
                    var parts = cookies[i].trim().split('=');
                    if (parts[0] === 'theme') { cookieTheme = parts[1]; break; }
                  }
                  var current = saved || cookieTheme;
                  var prefDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (current === 'dark' || (!current && prefDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${geologica.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
