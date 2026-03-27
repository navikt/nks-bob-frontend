import AppShell from "@/components/AppShell"
import CreateConversationContent from "@/components/content/CreateConversationContent"

export const dynamic = "force-dynamic"

export default function HomePage() {
  return (
    <AppShell>
      <CreateConversationContent />
    </AppShell>
  )
}
