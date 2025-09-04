
export function can(cap, caps = []) {
  if (!Array.isArray(caps)) return false;
  return caps.includes(cap);
}
