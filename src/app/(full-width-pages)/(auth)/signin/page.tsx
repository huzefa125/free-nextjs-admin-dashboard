import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Royal Auto Garage Sign In",
  description: "This is Royal Auto Garage Sign In",
};

export default function SignIn() {
  return <SignInForm />;
}
