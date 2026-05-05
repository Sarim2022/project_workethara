import { redirect } from "next/navigation";

export default function Home() {
  // Use /login since /sign-in gave a 404
  redirect("/login");
}