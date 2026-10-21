
import { AdminRequestDetails } from "@/components/pages/admin-dashboard/admin-request-details";

type PageProps = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

export default async function AdminRequestDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  return <AdminRequestDetails requestId={id} />;
}
