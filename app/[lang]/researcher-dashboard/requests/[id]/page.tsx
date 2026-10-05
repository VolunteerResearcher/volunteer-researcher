import { ResearcherRequestDetails } from "@/components/pages/researcher-dashboard/researcher-request-details";

type ResearcherRequestPageProps = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

export default async function ResearcherRequestPage({
  params,
}: ResearcherRequestPageProps) {
  const { id } = await params;

  return <ResearcherRequestDetails requestId={id} />;
}