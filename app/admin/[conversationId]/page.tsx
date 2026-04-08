import AppShell from "@/components/AppShell"
import ConversationAdminContent from "@/components/content/ConversationAdminContent"

export const dynamic = "force-dynamic"

export default function AdminConversationPage() {
  return (
    <AppShell>
      <ConversationAdminContent />
    </AppShell>
  )
}
