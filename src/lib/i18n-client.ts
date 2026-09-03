import { useTranslations } from "next-intl";
import enMessages from "../../messages/en.json";

export function useSafeTranslations(namespace?: keyof typeof enMessages | string) {
  try {
    const t = useTranslations(namespace as never);
    return (key: string, fallback?: string): string => {
      try {
        return t(key as never);
      } catch {
        const ns = namespace ? (enMessages as Record<string, Record<string, string>>)[namespace] : undefined;
        return fallback || ns?.[key] || key;
      }
    };
  } catch {
    return (key: string, fallback?: string): string => {
      const ns = namespace ? (enMessages as Record<string, Record<string, string>>)[namespace] : undefined;
      return fallback || ns?.[key] || key;
    };
  }
}
