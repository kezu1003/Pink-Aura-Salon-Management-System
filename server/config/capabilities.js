export const STAFF_BASE = [
  "view:own-schedule",
  "manage:appointments:assigned",
  "read:services",
  "request:inventory",
  "read:announcements",
];

export const SUPPLIER = [
  "read:announcements",
  "supplier:view-pos",
  "supplier:update-fulfillment",
  "supplier:invoices",
];

export function capsFor(user) {
  if (!user) return [];
  if (user.role === "supplier") return SUPPLIER;
  if (user.role === "staff") return STAFF_BASE;
  return [];
}
