
import { AdminBeneficiaryDetails } from "@/components/pages/admin-dashboard/admin-beneficiary-details";

type AdminBeneficiaryDetailsPageProps = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

export default async function AdminBeneficiaryDetailsPage({
  params,
}: AdminBeneficiaryDetailsPageProps) {
  const { id } = await params;

  return <AdminBeneficiaryDetails beneficiaryId={id} />;
}
