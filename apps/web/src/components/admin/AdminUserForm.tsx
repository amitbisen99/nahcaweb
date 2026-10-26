"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/Button";
import { AdminUserFormState } from "@/app/admin/admin-users/actions";
import { ADMIN_PERMISSIONS } from "@/lib/adminPermissions";
import { AdminUser } from "@/lib/adminUsers";

const initialState: AdminUserFormState = {};

const inputClass = "rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none";

// Used for both creating an admin (no `admin`) and editing one. Creating always
// makes a regular admin with the checked areas; promoting someone to super
// admin is done afterwards from the edit page.
export function AdminUserForm({
  admin,
  action,
  isSelf = false,
}: {
  admin?: AdminUser;
  action: (state: AdminUserFormState, formData: FormData) => Promise<AdminUserFormState>;
  isSelf?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [access, setAccess] = useState<"admin" | "super">(admin?.isSuperAdmin ? "super" : "admin");
  const isSuper = access === "super";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Name</span>
        <input type="text" name="name" required defaultValue={admin?.name} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Email</span>
        {admin ? (
          <input type="email" value={admin.email} disabled className={`${inputClass} bg-sand/20`} />
        ) : (
          <input type="email" name="email" required className={inputClass} />
        )}
      </label>

      {!admin && (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-black">Password</span>
          <input type="password" name="password" required minLength={8} className={inputClass} />
          <span className="text-xs text-black/60">At least 8 characters. Share it with them securely.</span>
        </label>
      )}

      {admin && (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-black">Access level</span>
          <select
            name="access"
            value={access}
            onChange={(e) => setAccess(e.target.value as "admin" | "super")}
            className={inputClass}
          >
            <option value="admin">Admin — only the areas checked below</option>
            <option value="super">Super admin — everything, and can manage other admins</option>
          </select>
        </label>
      )}

      <fieldset className="flex flex-col gap-2" disabled={isSuper}>
        <legend className="text-sm font-medium text-black">Areas this admin can open</legend>
        {isSuper && <p className="text-xs text-black/60">A super admin can open every area.</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          {ADMIN_PERMISSIONS.map((permission) => (
            <label key={permission.key} className="flex items-center gap-2 text-sm text-black">
              <input
                type="checkbox"
                name="permissions"
                value={permission.key}
                defaultChecked={isSuper || admin?.permissions.includes(permission.key)}
              />
              {permission.label}
            </label>
          ))}
        </div>
      </fieldset>

      {admin && (
        <label className="flex items-center gap-2 text-sm font-medium text-black">
          <input type="checkbox" name="isActive" defaultChecked={admin.isActive} disabled={isSelf} />
          Account active (untick to block this admin from logging in)
        </label>
      )}
      {isSelf && admin && <input type="hidden" name="isActive" value="on" />}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-forest">{state.success}</p>}

      <Button type="submit" variant="solid" className="self-start" disabled={isPending}>
        {isPending ? "Saving…" : admin ? "Save changes" : "Create admin"}
      </Button>
    </form>
  );
}
