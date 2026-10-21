
import { AdminConversation } from "@/components/pages/admin-dashboard/admin-conversation";

type PageProps = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

export default async function AdminConversationPage({
  params,
}: PageProps) {
  const { id } = await params;

  return <AdminConversation requestId={id} />;
}
