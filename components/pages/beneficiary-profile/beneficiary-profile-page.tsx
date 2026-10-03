import { BeneficiaryProfileHero } from "./beneficiary-profile-hero";
import { PersonalInfo } from "./personal-info";
import { RequestsTable } from "./requests-table";

export function BeneficiaryProfilePage() {
  return (
    <>
      <BeneficiaryProfileHero />
      <PersonalInfo />
      <RequestsTable />
    </>
  );
}