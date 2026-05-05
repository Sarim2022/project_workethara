import { redirect } from "next/navigation";

export default function Home() {
  // This automatically sends users to your login page
  redirect("/sign-in");
}