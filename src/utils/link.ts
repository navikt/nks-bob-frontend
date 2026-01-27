import { Context } from "../types/Message"
import { md } from "./markdown"

export function buildLinkTitle(context: Context): string {
  if (context.source === "nks") {
    return `${context.title} - ${context.ingress}`
  }

  const firstHeading = md.getFirstHeading(context.content)
  if (firstHeading !== null) {
    return `${context.title} - ${firstHeading}`
  }

  return context.title
}
