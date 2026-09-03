"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import type { UserRole } from "@prisma/client";
import { ArrowRight, Briefcase, Building2, ShieldCheck } from "lucide-react";
import { demoLoginAction } from "@/app/actions/auth";

type DemoAccount = {
  role: UserRole;
  label: string;
  name: string;
  sub: string;
  icon: typeof Briefcase;
  badge: string;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "BUYER",
    label: "Demo Buyer",
    name: "Alex Morgan",
    sub: "Northstar Capital · €1M–€8M ticket",
    icon: Briefcase,
    badge: "Buyer",
  },
  {
    role: "SELLER",
    label: "Demo Seller",
    name: "Olivia Hart",
    sub: "Hart Financial · 4 active listings",
    icon: Building2,
    badge: "Seller",
  },
  {
    role: "MANAGER",
    label: "Demo Manager",
    name: "Morgan Reed",
    sub: "Platform Lead · Moderation & audit",
    icon: ShieldCheck,
    badge: "Manager",
  },
];

export function DemoLoginButtons({ returnTo }: { returnTo?: string }) {
  const t = useTranslations("auth");
  const tNav = useTranslations("nav");
  const [isPending, startTransition] = useTransition();

  function handleDemoClick(role: UserRole) {
    startTransition(async () => {
      await demoLoginAction(role, returnTo);
    });
  }

  const roleLabels: Record<UserRole, string> = {
    BUYER: t("demoBuyer"),
    SELLER: t("demoSeller"),
    MANAGER: t("demoManager"),
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("demoLoginTitle")}
        </span>
        <span className="text-xs text-muted-foreground">{t("demoProfiles")}</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map(({ role, name, sub, icon: Icon, badge }) => (
          <button
            key={role}
            type="button"
            disabled={isPending}
            onClick={() => handleDemoClick(role)}
            className="group relative flex flex-col justify-between rounded-xl border border-hairline bg-surface p-3 text-left transition-all hover:border-brand hover:shadow-xs focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 disabled:pointer-events-none disabled:opacity-60"
          >
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex size-7 items-center justify-center rounded-lg bg-tint text-brand">
                  <Icon className="size-4" />
                </span>
                <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {badge}
                </span>
              </div>
              <div className="text-xs font-semibold text-ink group-hover:text-brand">
                {roleLabels[role]}
              </div>
              <div className="text-[11px] font-medium text-ink/80">{name}</div>
              <div className="text-[10px] text-muted-foreground line-clamp-1">{sub}</div>
            </div>

            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-brand">
              <span>{tNav("signIn")}</span>
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
