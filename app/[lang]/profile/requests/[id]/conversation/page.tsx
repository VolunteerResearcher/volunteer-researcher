import { ResearcherConversation } from "@/components/pages/beneficiary-profile/researcher-conversation";

type ConversationPageProps = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { id } = await params;

  return <ResearcherConversation requestId={id} />;
}