const isDev = process.env.MILJO === 'dev'

export const transfromNksUrls = <T extends {url: string}>(context: T): T => {
    if (!isDev) return context;
    return {
        ...context,
        url: context.url.replace(
            'https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb',
            'https://data.ansatt.dev.nav.no/quarto/03b51dc9-31c0-4486-ad2c-5d3396d0aa7d'
        )
    }
}

export const transformNksUrlsArray = <T extends { url: string }>(contexts: T[]): T[] => {
    return contexts.map(transfromNksUrls)
}