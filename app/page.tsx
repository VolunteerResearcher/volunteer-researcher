import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HomePage } from "@/components/pages/home/home-page";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <HomePage />
      <Footer />
    </main>
  );
}