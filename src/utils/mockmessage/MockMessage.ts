import { Message } from "../../types/Message.ts"

export const mockMessages: Message[] = [
  {
    id: "a6447e7d-5672-4bc7-92fe-fce1445146bc",
    content: "Hva er dagpenger?",
    createdAt: "2025-02-25T11:01:17.523039994",
    messageType: "question",
    messageRole: "human",
    citations: [],
    context: [],
    pending: false,
    errors: [],
    followUp: [],
    createdBy: "",
  },
  {
    id: "b8fd6266-324b-48df-a38a-2a4b419ee69f",
    content:
      "Dagpenger er en pengestøtte du kan få når du er arbeidsledig eller permittert. Formålet med dagpenger er å sikre inntekt i perioder hvor du ikke har arbeid. For å ha rett til dagpenger må du oppfylle visse krav til tidligere inntekt og arbeid.",
    createdAt: "2025-02-25T11:01:17.537888",
    messageType: "answer",
    messageRole: "ai",
    citations: [
      {
        text: "Dagpenger er en pengestøtte du kan få når du er arbeidsledig eller permittert.",
        sourceId: 4,
      },
      {
        text: "Dagpenger er en pengestøtte du kan få når du er arbeidsledig eller permittert.",
        sourceId: 5,
      },
      {
        text: "Vi bruker disse inntektene for å finne ut om du har rett til dagpenger: * Arbeidsinntekt * Foreldrepenger som arbeidstaker * Svangerskapspenger som arbeidstaker * Svangerskapsrelaterte sykepenger som arbeidstaker.",
        sourceId: 6,
      },
      {
        text: "For å ha rett til dagpenger, så må du ha hatt en arbeidsinntekt på minst 1,5 ganger folketrygdens grunnbeløp (G) i løpet av de siste 12 avsluttede kalendermånedene.",
        sourceId: 2,
      },
    ],
    context: [
      {
        content:
          '## **Forbruk av stønadsperioden på dagpenger ved sykemelding**\n\n**Til veileder i Nav kontaktsenter:**\n\nSe "Mer informasjon" i artikkelen [Dagpenger DP - Stønadsperiode - Hvor lenge kan du få dagpenger](/articles/Knowledge/Dagpenger-Stønadsperiode)',
        title: "Dagpenger DP - Dagpenger og sykepenger",
        ingress: "Mer informasjon",
        source: "nks",
        url: "https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/Dagpenger/kA02o000000M7PACA0.html",
        anchor: "mer-informasjon",
        articleId: "kA02o000000M7PACA0",
        articleColumn: "Article__c",
        lastModified: null,
        semanticSimilarity: 0.5656383633613586,
      },
      {
        content:
          "I Norge kaller vi arbeidsledighetstrygd for dagpenger.  \n  \nOm du kan få dagpenger i Norge eller arbeidsledighetstrygd fra et annet EØS-land avhenger av hvor du har bodd og jobbet før du ble arbeidsledig eller permittert. På [nav.no/dagpenger#eos](http://www.nav.no/dagpenger#eos) kan du lese mer om hva som gjelder for deg.",
        title: "Dagpenger DP - EØS",
        ingress: "Til brukeren",
        source: "nks",
        url: "https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/Dagpenger/kA02o000000M7NwCAK.html",
        anchor: "til-bruker",
        articleId: "kA02o000000M7NwCAK",
        articleColumn: "NKS_User__c",
        lastModified: null,
        semanticSimilarity: 0.6160714626312256,
      },
      {
        content:
          "For å ha rett til dagpenger, så må du ha hatt en arbeidsinntekt på minst 1,5 ganger folketrygdens grunnbeløp (G) i løpet av de siste 12 avsluttede kalendermånedene, eller minst 3 ganger grunnbeløpet i løpet av de 36 siste avsluttede kalendermånedene forut for tidspunktet du søker om dagpenger. Du kan lese mer på [nav.no/dagpenger#hvem](http://www.nav.no/dagpenger#hvem)  \n  \nMed arbeidsinntekt menes lønn som du får utbetalt for utført arbeid etter en arbeidsavtale hos en arbeidsgiver. Foreldrepenger, svangerskapspenger og svangerskapsrelaterte sykepenger er likestilt med arbeidsinntekt og regnes med. Ytelsene må være opptjent som arbeidstaker for at de skal likestilles med arbeidsinntekt. Inntekt som selvstendig næringsdrivende og dagpenger fra tidligere perioder regnes ikke med.\n\nEn og samme inntekt gir bare rett til dagpenger i en enkelt stønadsperiode på enten 52 eller 104 uker. Dette betyr at du må ha opparbeidet deg en ny minsteinntekt på minst 1,5 ganger folketrygdens grunnbeløp (G) i løpet av de siste 12 avsluttede kalendermånedene eller minst 3 G i løpet av de 36 siste avsluttede kalendermånedene, hvis du må søke om ny stønadsperiode.",
        title: "Dagpenger DP - Inntekt",
        ingress: "Til brukeren",
        source: "nks",
        url: "https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/Dagpenger/kA02o000000M7NpCAK.html",
        anchor: "til-bruker",
        articleId: "kA02o000000M7NpCAK",
        articleColumn: "NKS_User__c",
        lastModified: null,
        semanticSimilarity: 0.5863324403762817,
      },
      {
        content:
          "## Dagpenger\n\nDersom du har gradert uføretrygd, har jobbet i tillegg, og blitt arbeidsledig eller permittert kan du ha rett på dagpenger.  For å få vurdert din rett må du registrere deg som arbeidssøker på [nav.no/registrerdeg](http://www.nav.no/registrerdeg), sende meldekort og søke om dagpenger. Har du innvilget 100 prosent uføretrygd, så vil du ikke ha rett på dagpenger. Det er et vilkår at du kan jobbe minst 30% for å kunne ha rett på dagpenger. Dagpenger er pensjonsgivende inntekt, og vil kunne redusere  utbetalingen av uføretrygden og eventuelle tillegg på samme måte som arbeidsinntekt gjør. Husk derfor å legge inn dagpengene som forventet inntekt i inntektsplanleggeren nav.no/inntektsplanleggeren.  Når du registrerer annen forventet inntekt via Inntektsplanleggeren, som gir ny beregning, vil det dannes ett nytt brev i din innboks. Endringen vil gjelde fra påfølgende måned.  \n  \nDu kan lese mer om å jobbe ved siden av uføretrygd på [nav.no/uføre-jobb](http://www.nav.no/uf%C3%B8re-jobb)   \nDu kan lese mer om etteroppgjør av uføretrygd på [nav.no/uføre-etteroppgjør](http://www.nav.no/uf%C3%B8re-etteroppgj%C3%B8r)    \n  \nHar du generelle spørsmål kan du kontakte oss på chatten vår: [nav.no/person/kontakt-oss/chat/ufor](http://www.nav.no/person/kontakt-oss/chat/ufor)",
        title: "Uføre - Kombinasjon med andre ytelser",
        ingress: "Til brukeren",
        source: "nks",
        url: "https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/Arbeidsavklaringspenger/kA07U000000g3yGSAQ.html",
        anchor: "til-bruker",
        articleId: "kA07U000000g3yGSAQ",
        articleColumn: "NKS_User__c",
        lastModified: null,
        semanticSimilarity: 0.6304022669792175,
      },
      {
        content:
          "## Hva kan du få?\n### Hvor lenge kan du få?\n#### Hvilke inntekter avgjør hvor lenge du kan få?\nVi bruker disse inntektene for å beregne hvor lenge du kan få dagpenger:\n\n* Arbeidsinntekt\n* Foreldrepenger\n* Svangerskapspenger\n* Svangerskapsrelaterte sykepenger\n\nDisse inntektene regnes ikke som arbeidsinntekt:\n\n* Inntekt som selvstendig næringsdrivende\n* Arbeidsavklaringspenger (AAP)",
        title: "Dagpenger",
        ingress:
          "Dagpenger er en pengestøtte du kan få når du er arbeidsledig eller permittert.",
        source: "navno",
        url: "https://www.nav.no/dagpenger",
        anchor: "hvor-lenge",
        articleId: "/dagpenger",
        articleColumn: null,
        lastModified: "2025-02-20T12:31:39.974091",
        semanticSimilarity: 0.7137966752052307,
      },
      {
        content:
          "## Hvem kan få?\n### Hvis du er permittert\nSom permittert har du som hovedregel rett til lønn fra arbeidsgiveren din de 15 første arbeidsdagene du er permittert. Hvis du er delvis permittert, kan de 15 arbeidsdagene med lønn strekke seg over en lengre periode. Etter denne perioden med lønn, kan du få dagpenger.\n\nFor at du skal ha rett til dagpenger som permittert må permitteringsårsaken være mangel på arbeid i bedriften, eller andre forhold som arbeidsgiveren din ikke kan påvirke. Grunnen til at du permitteres kan derfor ha betydning for din rett til dagpenger. Nav vurderer om permitteringsårsaken gir deg rett til dagpenger.",
        title: "Dagpenger",
        ingress:
          "Dagpenger er en pengestøtte du kan få når du er arbeidsledig eller permittert.",
        source: "navno",
        url: "https://www.nav.no/dagpenger",
        anchor: "permittert",
        articleId: "/dagpenger",
        articleColumn: null,
        lastModified: "2025-02-20T12:31:39.974091",
        semanticSimilarity: 0.712177038192749,
      },
      {
        content:
          "## Hvem kan få?\n### Hvem kan få dagpenger?\n#### Hvilke inntekter gir rett til dagpenger?\nVi bruker disse inntektene for å finne ut om du har rett til dagpenger:\n\n* Arbeidsinntekt\n* Foreldrepenger som arbeidstaker\n* Svangerskapspenger som arbeidstaker\n* Svangerskapsrelaterte sykepenger som arbeidstaker\n\nDisse inntektene regnes ikke som arbeidsinntekt:\n\n* Inntekt som selvstendig næringsdrivende\n* Arbeidsavklaringspenger (AAP)",
        title: "Dagpenger",
        ingress:
          "Dagpenger er en pengestøtte du kan få når du er arbeidsledig eller permittert.",
        source: "navno",
        url: "https://www.nav.no/dagpenger",
        anchor: "hvem-kan",
        articleId: "/dagpenger",
        articleColumn: null,
        lastModified: "2025-02-20T12:31:39.974091",
        semanticSimilarity: 0.7035934329032898,
      },
      {
        content:
          "## Hva kan du få?\n### Hvor lenge kan du få?\n#### Har du vært permittert de siste 18 månedene?\nBlir du permittert på nytt av samme arbeidsgiver innenfor en periode på 18 måneder, vil du fortsette på de 26 ukene du kan være permittert. For eksempel, hvis du tidligere var permittert i 20 uker de siste 18 månedene, kan du nå være permittert i 6 uker.\n\nHar det gått mer enn 18 måneder siden forrige permittering fra samme arbeidsgiver, kan du være permittert i 26 uker.\n\nBlir du permittert av en annen arbeidsgiver kan du være permittert derfra i 26 uker uavhengig av om du har vært permittert tidligere",
        title: "Dagpenger",
        ingress:
          "Dagpenger er en pengestøtte du kan få når du er arbeidsledig eller permittert.",
        source: "navno",
        url: "https://www.nav.no/dagpenger",
        anchor: "hvor-lenge",
        articleId: "/dagpenger",
        articleColumn: null,
        lastModified: "2025-02-20T12:31:39.974091",
        semanticSimilarity: 0.6985689401626587,
      },
      {
        content:
          "## Hva sier loven?\n* [Kapittel 4. Dagpenger under arbeidsløshet (lovdata.no)](https://lovdata.no/nav/folketrygdloven/kap4)\n* [Hovednr. 45 – Rundskriv til EØS-avtalens bestemmelser om trygd (lovdata.no)](https://lovdata.no/nav/rundskriv/r45-00/kap0#kap0)",
        title: "Dagpenger",
        ingress:
          "Dagpenger er en pengestøtte du kan få når du er arbeidsledig eller permittert.",
        source: "navno",
        url: "https://www.nav.no/dagpenger",
        anchor: "loven",
        articleId: "/dagpenger",
        articleColumn: null,
        lastModified: "2025-02-20T12:31:39.974091",
        semanticSimilarity: 0.697476863861084,
      },
    ],
    pending: false,
    errors: [],
    followUp: [
      "Hvilke krav må oppfylles for å få dagpenger?",
      "Hvor lenge kan man motta dagpenger?",
      "Hvordan påvirker permittering retten til dagpenger?",
    ],
    createdBy: "",
  },
]
