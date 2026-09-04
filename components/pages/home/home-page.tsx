import { Hero } from "./hero";
import { Services } from "./services";
import { Statistics } from "./statistics";
import { Goals } from "./goals";

export function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Statistics />
      <Goals />
    </>
  );
}