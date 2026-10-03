import { AboutHero } from "./about-hero";
import { AboutIntro } from "./about-intro";
import { AboutProcess } from "./about-process";
import { AboutAudience } from "./about-audience";
import { AboutCta } from "./about-cta";

export function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutIntro />
      <AboutProcess />
      <AboutAudience />
      <AboutCta />
    </>
  );
}