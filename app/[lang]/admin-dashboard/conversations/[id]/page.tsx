
import { AdminConversationDetails } from "@/components/pages/admin-dashboard/admin-conversation-details";

type AdminConversationDetailsPageProps = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

export default async function AdminConversationDetailsPage({
  params,
}: AdminConversationDetailsPageProps) {
  const { id } = await params;

  return <AdminConversationDetails conversationId={id} />;
}
