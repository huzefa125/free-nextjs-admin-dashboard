import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Royal Auto Garage Sign Up",
  description: "This is Next.js SignUp Page Royal Auto Garage",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
