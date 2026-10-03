import { ConsultationHero } from "./consultation-hero";
import { ConsultationType } from "./consultation-type";
import { RequesterInfo } from "./requester-info";
import { ConsultationForm } from "./consultation-form";

export function ConsultationPage() {
  return (
    <>
      <ConsultationHero />
      <ConsultationType />
      <RequesterInfo />
      <ConsultationForm />
    </>
  );
}