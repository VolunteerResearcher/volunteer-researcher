import { RequestDetails } from "@/components/pages/beneficiary-profile/request-details";

type RequestDetailsPageProps = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

export default async function RequestDetailsPage({
  params,
}: RequestDetailsPageProps) {
  const { id } = await params;

  return <RequestDetails requestId={id} />;
}