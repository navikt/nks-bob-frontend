import { isLocalDev } from "./nksUrlTransformer";
import { Context, Contexts } from "../types/Message";

const isLocal = isLocalDev

export const transformNavUrls = (context: Context): Context => {
    if (!isLocal || context.source !== "navno") return context

    return {
        ...context,
        url: context.url.replace(/^https:\/\/www\.nav\.no(?=\/|$)/, "https://www.ansatt.dev.nav.no")
    }
}

export const transformNavUrlsArray = (contexts: Contexts): Contexts => {
    const entries: [string, Context][] = Object.entries(contexts).map(([sourceId, context]) => [ 
    sourceId, 
    transformNavUrls(context),
])

return Object.fromEntries(entries)
}