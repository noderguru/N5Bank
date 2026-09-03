import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import uk from "../../messages/uk.json";
import ru from "../../messages/ru.json";

function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("i18n Translation dictionaries (N5B-90)", () => {
  const enKeys = getKeys(en);
  const ukKeys = getKeys(uk);
  const ruKeys = getKeys(ru);

  it("ensures all en keys exist in uk and ru without missing translations", () => {
    const missingInUk = enKeys.filter((k) => !ukKeys.includes(k));
    const missingInRu = enKeys.filter((k) => !ruKeys.includes(k));

    expect(missingInUk).toEqual([]);
    expect(missingInRu).toEqual([]);
  });

  it("verifies accurate financial terminology in Ukrainian (uk)", () => {
    expect(uk.marketplace.askingPrice).toBe("Запитувана ціна");
    expect(uk.marketplace.licenseType).toBe("Тип ліцензії");
    expect(uk.marketplace.businessStatus).toBe("Статус бізнесу");
    expect(uk.common.uponLoi).toBe("За запитом LOI");
    expect(uk.common.underNda).toBe("Під NDA");
    expect(uk.marketplace.investmentThesis).toBe("Інвестиційна теза");
  });

  it("verifies accurate financial terminology in Russian (ru)", () => {
    expect(ru.marketplace.askingPrice).toBe("Запрашиваемая цена");
    expect(ru.marketplace.licenseType).toBe("Тип лицензии");
    expect(ru.marketplace.businessStatus).toBe("Статус бизнеса");
    expect(ru.common.uponLoi).toBe("По запросу LOI");
    expect(ru.common.underNda).toBe("Под NDA");
    expect(ru.marketplace.investmentThesis).toBe("Инвестиционный тезис");
  });
});
