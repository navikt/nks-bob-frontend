import AppShell from "@/components/AppShell"
import ConversationContent from "@/components/content/ConversationContent"

export const dynamic = "force-dynamic"

export default function ConversationPage() {
  return (
    <AppShell>
      <ConversationContent />
    </AppShell>
  )
}
