import { expect, Page, test, WebSocketRoute } from "@playwright/test"
import { resolve, sep } from "node:path"

const currentConversationId = "00000000-0000-0000-0000-000000000101"
const notificationConversationId = "00000000-0000-0000-0000-000000000202"
const unavailableConversationId = "00000000-0000-0000-0000-000000000303"

type Harness = {
  notificationSockets: WebSocketRoute[]
  messageSockets: WebSocketRoute[]
  notificationClientFrames: string[]
  conversationListRequests: number
  unavailableConversationIds: Set<string>
}

async function installMocks(page: Page): Promise<Harness> {
  const harness: Harness = {
    notificationSockets: [],
    messageSockets: [],
    notificationClientFrames: [],
    conversationListRequests: 0,
    unavailableConversationIds: new Set(),
  }

  const dist = resolve("dist")
  await page.route("http://bob.test/**", async (route) => {
    const path = new URL(route.request().url()).pathname
    const file = path.startsWith("/assets/") ? resolve(dist, `.${path}`) : resolve(dist, "index.html")
    if (!file.startsWith(`${dist}${sep}`)) throw new Error("Asset outside the frontend build")
    await route.fulfill({ path: file })
  })
  await page.route(/^https:\/\//, (route) => route.abort())

  await page.route("**/bff/**", async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith("/session")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          userKey: "synthetic-user",
          credentialVersion: "v1",
          expiresAt: Date.now() + 60 * 60 * 1000,
          conversationNotificationsEnabled: true,
        }),
      })
      return
    }
    if (path.endsWith("/userinfo")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          fullnameInverted: "Nordmann, Ola",
          fullname: "Ola Nordmann",
          firstName: "Ola",
          lastName: "Nordmann",
          email: null,
        }),
      })
      return
    }
    if (path.endsWith("/version")) {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ version: "e2e" }) })
      return
    }
    await route.fulfill({ status: 204 })
  })

  await page.route("**/bob-api/**", async (route) => {
    const path = new URL(route.request().url()).pathname
    const method = route.request().method()

    if (method === "GET" && path.endsWith("/api/v1/conversations")) {
      harness.conversationListRequests += 1
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: notificationConversationId,
            title: "Syntetisk integrasjonssamtale",
            createdAt: new Date().toISOString(),
          },
        ]),
      })
      return
    }

    const messagesMatch = path.match(/\/api\/v1\/conversations\/([^/]+)\/messages$/)
    if (method === "GET" && messagesMatch) {
      if (harness.unavailableConversationIds.has(messagesMatch[1])) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ message: "Conversation not found" }),
        })
        return
      }
      await route.fulfill({ contentType: "application/json", body: "[]" })
      return
    }

    if (path.endsWith("/api/v1/notifications/news") || path.endsWith("/api/v1/notifications/errors")) {
      await route.fulfill({ contentType: "application/json", body: "[]" })
      return
    }
    if (path.endsWith("/api/v1/user/config")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          showStartInfo: false,
          showTutorial: false,
          showNewConceptInfo: false,
          userType: "user",
        }),
      })
      return
    }
    await route.fulfill({ contentType: "application/json", body: "{}" })
  })

  await page.routeWebSocket("**/bob-api-ws/api/v2/conversations/notifications/ws", (socket) => {
    harness.notificationSockets.push(socket)
    socket.onMessage((message) => harness.notificationClientFrames.push(String(message)))
  })
  await page.routeWebSocket("**/bob-api-ws/api/v2/conversations/*/messages/ws", (socket) => {
    harness.messageSockets.push(socket)
  })

  return harness
}

async function openApp(page: Page, path = "/") {
  const harness = await installMocks(page)
  await page.goto(path)
  await expect.poll(() => harness.notificationSockets.length, { timeout: 10_000 }).toBe(1)
  return harness
}

function sendNotification(socket: WebSocketRoute, conversationId: string) {
  socket.send(JSON.stringify({ type: "ConversationCreated", conversationId }))
}

function assistantMessage(id: string) {
  return {
    id,
    content: "",
    createdAt: new Date().toISOString(),
    messageType: "answer",
    messageRole: "ai",
    createdBy: "synthetic-assistant",
    citations: [],
    context: {},
    pending: true,
    errors: [],
    followUp: [],
    contextualizedQuestion: null,
    tools: [],
    thinking: [],
  }
}

test("incoming notices preserve the open conversation and draft, without interrupting streaming", async ({ page }) => {
  const harness = await openApp(page, `/samtaler/${currentConversationId}`)
  const draft = page.getByPlaceholder(/Hva kan jeg hjelpe deg med\?/)
  await expect(draft).toBeVisible()
  await expect.poll(() => harness.messageSockets.length, { timeout: 10_000 }).toBe(1)

  await draft.fill("Utkast som skal bevares")
  await expect(draft).toBeFocused()
  const messageSocket = harness.messageSockets[0]
  messageSocket.send(
    JSON.stringify({
      type: "NewMessage",
      id: "streamed-answer",
      message: assistantMessage("streamed-answer"),
    }),
  )
  messageSocket.send(
    JSON.stringify({
      type: "ContentUpdated",
      id: "streamed-answer",
      content: "Første del av et strømmende svar",
    }),
  )
  await expect(page.getByText("Første del av et strømmende svar", { exact: true })).toBeVisible()
  const focusedBeforeNotice = await page.evaluate(() => document.activeElement?.tagName)
  const listRequestsBeforeNotice = harness.conversationListRequests

  sendNotification(harness.notificationSockets[0], notificationConversationId)

  await expect(page.getByText("En ny samtale er opprettet", { exact: true })).toBeVisible()
  await expect(page).toHaveURL(new RegExp(`/samtaler/${currentConversationId}$`))
  await expect(draft).toHaveValue("Utkast som skal bevares")
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe(focusedBeforeNotice)
  await expect.poll(() => harness.conversationListRequests).toBe(listRequestsBeforeNotice + 1)

  messageSocket.send(
    JSON.stringify({
      type: "ContentUpdated",
      id: "streamed-answer",
      content: " – og fortsettelsen",
    }),
  )
  await expect(page.getByText("Første del av et strømmende svar – og fortsettelsen", { exact: true })).toBeVisible()
  await expect(draft).toHaveValue("Utkast som skal bevares")
  expect(harness.notificationClientFrames).toEqual([])
})

test("duplicates and invalid frames do not create extra notices, including after reconnect", async ({ page }) => {
  const harness = await openApp(page)
  const initialListRequests = harness.conversationListRequests
  const firstSocket = harness.notificationSockets[0]

  firstSocket.send("not JSON")
  firstSocket.send(JSON.stringify({ type: "UnknownEvent", conversationId: notificationConversationId }))
  firstSocket.send(JSON.stringify({ type: "ConversationCreated", conversationId: "not-a-uuid" }))
  await expect(page.getByText("En ny samtale er opprettet", { exact: true })).toHaveCount(0)

  sendNotification(firstSocket, notificationConversationId)
  await expect(page.getByText("En ny samtale er opprettet", { exact: true })).toBeVisible()
  await expect.poll(() => harness.conversationListRequests).toBe(initialListRequests + 1)

  sendNotification(firstSocket, notificationConversationId)
  firstSocket.close({ code: 1013, reason: "synthetic reconnect" })
  await expect.poll(() => harness.notificationSockets.length, { timeout: 10_000 }).toBe(2)
  await expect.poll(() => harness.conversationListRequests, { timeout: 10_000 }).toBe(initialListRequests + 2)

  sendNotification(harness.notificationSockets[1], notificationConversationId)
  await page.getByRole("button", { name: "Vis varsler" }).click()
  await expect(page.getByRole("group", { name: "Nye samtaler i denne økten" })).toBeVisible()
  await expect(page.getByRole("menuitem", { name: /Åpne samtalen/ })).toHaveCount(1)
  expect(harness.conversationListRequests).toBe(initialListRequests + 2)
  expect(harness.notificationClientFrames).toEqual([])
})

test("a dismissed banner remains available in the menu and its link works by keyboard without reconnecting", async ({
  page,
}) => {
  const harness = await openApp(page)
  sendNotification(harness.notificationSockets[0], notificationConversationId)

  const bannerLink = page.getByRole("link", { name: "Åpne samtalen" })
  await expect(bannerLink).toHaveAttribute("href", `/samtaler/${notificationConversationId}`)
  await page.getByRole("button", { name: "Lukk samtalebeskjeden" }).click()
  await expect(page.getByText("En ny samtale er opprettet", { exact: true })).toHaveCount(0)

  await page.getByRole("button", { name: "Vis varsler" }).click()
  const menuLink = page.getByRole("menuitem", { name: /Åpne samtalen/ })
  await expect(menuLink).toBeVisible()
  await expect(menuLink).toHaveAttribute("href", `/samtaler/${notificationConversationId}`)
  await menuLink.focus()
  await page.keyboard.press("Enter")

  await expect(page).toHaveURL(new RegExp(`/samtaler/${notificationConversationId}$`))
  await expect(page.getByPlaceholder(/Hva kan jeg hjelpe deg med\?/)).toBeVisible()
  expect(harness.notificationSockets).toHaveLength(1)
})

test("the banner link handles an unavailable conversation through the existing fallback", async ({ page }) => {
  const harness = await installMocks(page)
  harness.unavailableConversationIds.add(unavailableConversationId)
  await page.goto("/")
  await expect.poll(() => harness.notificationSockets.length, { timeout: 10_000 }).toBe(1)
  sendNotification(harness.notificationSockets[0], unavailableConversationId)

  const link = page.getByRole("link", { name: "Åpne samtalen" })
  await expect(link).toHaveAttribute("href", `/samtaler/${unavailableConversationId}`)
  await link.focus()
  await page.keyboard.press("Enter")

  await expect(page).toHaveURL(new RegExp(`/samtaler/${unavailableConversationId}$`))
  await expect(page.getByText("Samtalen ble ikke funnet")).toBeVisible()
  expect(harness.notificationSockets).toHaveLength(1)
})

test("each synthetic tab receives its own live notification connection", async ({ page, context }) => {
  const firstHarness = await openApp(page)
  const secondPage = await context.newPage()
  const secondHarness = await openApp(secondPage)

  sendNotification(firstHarness.notificationSockets[0], notificationConversationId)
  sendNotification(secondHarness.notificationSockets[0], notificationConversationId)

  await expect(page.getByText("En ny samtale er opprettet", { exact: true })).toBeVisible()
  await expect(secondPage.getByText("En ny samtale er opprettet", { exact: true })).toBeVisible()
  expect(firstHarness.notificationSockets).toHaveLength(1)
  expect(secondHarness.notificationSockets).toHaveLength(1)
})
