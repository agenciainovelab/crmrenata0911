import LoginPolitico from "@/components/Auth/LoginPolitico";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Sistema Político",
};

export default function SignIn() {
  return <LoginPolitico />;
}
