import { Context, Contexts } from "../../types/Message"

const ARTICLE_COLUMN_MAPPING: Record<string, string> = {
  EmployerInformation__c: "arbeidsgiver_1",
  EmployerInformationInternal__c: "arbeidsgiver_1",
  InternationalInformation__c: "internasjonalt_1",
  InternationalInformationInternal__c: "internasjonalt_1",
  AdvisorInformation__c: "lege-og-behandler_1",
  AdvisorInformationInternal__c: "lege-og-behandler_1",
}

export const transformArticleColumn = (context: Context): Context => {
  return {
    ...context,
    articleColumn: ARTICLE_COLUMN_MAPPING[context.articleColumn!] || context.articleColumn,
  }
}

export const transformArticleColumnArray = (contexts: Contexts): Contexts => {
  const entries: [string, Context][] = Object.entries(contexts).map(([sourceId, context]) => [
    sourceId,
    transformArticleColumn(context),
  ])

  return Object.fromEntries(entries)
}

export const transformArticleColumnValue = (articleColumn: string): string => {
  return ARTICLE_COLUMN_MAPPING[articleColumn] || articleColumn
}
