import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextRequest, NextResponse } from "next/server";

export enum Language {
  EN = "en",
  FR = "fr",
}

export const SupportLocales = [Language.EN, Language.FR];

export const FallbackLang = Language.EN;

export const DefaultNameSpace = "Common";

export const I18nCookieName = "i18next";

export const getI18nOptions = (
  lang: Language = FallbackLang,
  ns: string | string[] = DefaultNameSpace
) => ({
  // debug: true,
  supportedLngs: SupportLocales,
  fallbackLng: FallbackLang,
  lng: lang,
  fallbackNS: DefaultNameSpace,
  defaultNS: DefaultNameSpace,
  ns,
});

export const config = {
  // matcher: '/:lng*'
  matcher: [
    "/((?!api|_next/static|_next/images|icons|images|assets|favicon.ico|sw.js).*)",
  ],
};

const getAcceptLanguages = (req: NextRequest): Language => {
  if (req.headers.has("accept-language")) return FallbackLang;

  const headers = {
    "accept-language": req.headers.get("accept-language") ?? "",
  };

  const acceptLanguages = new Negotiator({
    headers,
  }).languages();

  return match(acceptLanguages, SupportLocales, FallbackLang) as Language;
};

export function middleware(req: NextRequest) {
  let lng: string | undefined | null = req.cookies.get(I18nCookieName)?.value;
  if (!lng) lng = getAcceptLanguages(req);

  // Redirect if lng in path is not supported
  if (
    !SupportLocales.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith("/_next")
  ) {
    return NextResponse.redirect(
      new URL(`/${lng}${req.nextUrl.pathname}`, req.url)
    );
  }

  const ref = req.headers.get("referer");
  if (ref) {
    const refererUrl = new URL(ref);
    const langInReferer = SupportLocales.find((l) =>
      refererUrl.pathname.startsWith(`/${l}`)
    );
    const response = NextResponse.next();
    if (langInReferer) response.cookies.set(I18nCookieName, langInReferer);
    return response;
  }

  return NextResponse.next();
}
