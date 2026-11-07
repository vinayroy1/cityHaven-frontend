import { redirect } from "next/navigation";

/** Replaced by the owner-first "Create listing" hub, which saves listings in the owner's account. */
export default function AdminPropertyCreatePage() {
  redirect("/admin/listings/create?type=property");
}
