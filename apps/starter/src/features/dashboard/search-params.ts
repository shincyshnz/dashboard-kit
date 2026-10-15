import { parseAsString, parseAsStringLiteral } from "nuqs";

/**
 * URL state for the dashboard, defined once.
 * Every filter lives in the URL, so a filtered view can be bookmarked or shared.
 */
export const orderStatuses = ["all", "paid", "pending", "failed"] as const;
export type OrderStatusFilter = (typeof orderStatuses)[number];

export const ordersSearchParams = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(orderStatuses).withDefault("all"),
};
