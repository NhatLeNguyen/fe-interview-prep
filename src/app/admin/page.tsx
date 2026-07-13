import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export default function AdminHomePage() {
  redirect(ROUTES.ADMIN_QUESTIONS);
}
