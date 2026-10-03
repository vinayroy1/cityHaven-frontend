import { redirect } from "next/navigation";

export default function OrgListingsRedirect() {
  redirect("/dashboard/properties?scope=org");
}
