module.exports = { createConversation, createMessage };

const QUESTIONS = [
  "Hva er dagpenger?",
  "Hva er sykepenger?",
  "Hva er foreldrepenger?",
  "Hva er AAP?",
  "Hva er overgangsstønad?",
  "Kan dagpenger samordnes med sykepenger?",
  "Kan foreldrepenger samordnes med sykepenger?",
  "Når kan jeg gå av med pensjon?",
  "Hei Bob, hvordan går det?",
]

function randomQuestion() {
  const randomIndex = Math.floor(Math.random() * QUESTIONS.length)
  return QUESTIONS[randomIndex]
}

function createConversation(userContext, _events, done) {
  const question = randomQuestion()

  userContext.vars.data = {
    title: question,
    initialMessage: {
      content: question
    }
  }

  return done()
}

function createMessage(userContext, _events, done) {
  const question = randomQuestion()

  userContext.vars.data = {
    content: question
  }

  return done()
}
