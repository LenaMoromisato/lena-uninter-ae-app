import { ConversationThreadScreen } from '@features/conversations/components/conversations-screen';

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;
  return <ConversationThreadScreen conversationId={id} />;
}
