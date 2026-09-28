import React from "react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../hooks/useTranslation";

interface ComparisonItem {
  title: string;
  centralized: string;
  nostr: string;
}

export interface ProtocolComparisonProps {
  items?: ComparisonItem[];
  className?: string;
}

export function ProtocolComparison({
  items,
  className,
}: ProtocolComparisonProps) {
  const { t } = useTranslation();

  const defaultItems: ComparisonItem[] = [
    {
      title: t("protocolComparisonUI.items.identity.title"),
      centralized: t("protocolComparisonUI.items.identity.centralized"),
      nostr: t("protocolComparisonUI.items.identity.nostr"),
    },
    {
      title: t("protocolComparisonUI.items.data.title"),
      centralized: t("protocolComparisonUI.items.data.centralized"),
      nostr: t("protocolComparisonUI.items.data.nostr"),
    },
    {
      title: t("protocolComparisonUI.items.clients.title"),
      centralized: t("protocolComparisonUI.items.clients.centralized"),
      nostr: t("protocolComparisonUI.items.clients.nostr"),
    },
    {
      title: t("protocolComparisonUI.items.censorship.title"),
      centralized: t("protocolComparisonUI.items.censorship.centralized"),
      nostr: t("protocolComparisonUI.items.censorship.nostr"),
    },
  ];

  const displayItems = items || defaultItems;

  return (
    <div className={cn("not-prose border-t border-gray-200 dark:border-gray-800", className)}>
      {displayItems.map((item) => (
        <section
          key={item.title}
          className="border-b border-gray-200 py-5 dark:border-gray-800"
        >
          <h4 className="text-h3 font-semibold text-gray-900 dark:text-white">{item.title}</h4>
          <div className="mt-3 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <div>
              <p className="text-micro font-semibold uppercase text-gray-500 dark:text-gray-400">
                {t("protocolComparisonUI.centralizedLabel")}
              </p>
              <p className="mt-1 text-body-sm text-gray-600 dark:text-gray-300">{item.centralized}</p>
            </div>
            <div>
              <p className="text-micro font-semibold uppercase text-primary-text dark:text-primary-400">
                {t("protocolComparisonUI.nostrLabel")}
              </p>
              <p className="mt-1 text-body-sm text-gray-900 dark:text-white">{item.nostr}</p>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
