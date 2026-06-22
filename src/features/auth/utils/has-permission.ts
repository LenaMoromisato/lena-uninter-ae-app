export function hasPermission(permissionCodes: string[], code: string) {
  return permissionCodes.includes(code);
}

export function hasAnyPermission(permissionCodes: string[], codes: string[]) {
  return codes.some((code) => hasPermission(permissionCodes, code));
}

export function hasAllPermissions(permissionCodes: string[], codes: string[]) {
  return codes.every((code) => hasPermission(permissionCodes, code));
}
