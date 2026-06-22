'use client';

import type { PermissionResponse } from '@features/rbac/api/rbac';
import type { PermissionCode } from '@core/constants/permissions';
import { Label } from '@shadcn/ui/label';

type PermissionMatrixProps = {
  permissions: PermissionResponse[];
  selectedCodes: PermissionCode[];
  onChange: (codes: PermissionCode[]) => void;
  disabled?: boolean;
};

function groupByResource(permissions: PermissionResponse[]) {
  return permissions.reduce<Record<string, PermissionResponse[]>>((groups, permission) => {
    const list = groups[permission.resource] ?? [];
    list.push(permission);
    groups[permission.resource] = list;
    return groups;
  }, {});
}

export function PermissionMatrix({
  permissions,
  selectedCodes,
  onChange,
  disabled = false,
}: PermissionMatrixProps) {
  const groups = groupByResource(permissions);

  function toggle(code: PermissionCode) {
    if (disabled) return;

    if (selectedCodes.includes(code)) {
      onChange(selectedCodes.filter((item) => item !== code));
      return;
    }

    onChange([...selectedCodes, code]);
  }

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([resource, items]) => (
        <div key={resource} className="space-y-3">
          <h3 className="text-sm font-medium capitalize">{resource.replace(/_/g, ' ')}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((permission) => {
              const code = permission.code as PermissionCode;
              const id = `permission-${code}`;
              const checked = selectedCodes.includes(code);

              return (
                <label
                  key={permission.code}
                  htmlFor={id}
                  className="flex cursor-pointer items-start gap-2 rounded-lg border p-3 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
                >
                  <input
                    id={id}
                    type="checkbox"
                    className="mt-1"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggle(code)}
                  />
                  <span className="space-y-1">
                    <Label htmlFor={id} className="font-medium">
                      {permission.label}
                    </Label>
                    <span className="block text-xs text-muted-foreground">{permission.code}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
