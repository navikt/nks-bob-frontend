import { http, HttpResponse } from "msw"
import { MessageRole, MessageType } from "../types/message"

export const handlers = [
  http.get("/bob-api/api/v1/conversations", () => {
    return HttpResponse.json([
      {
        id: "123",
        title: "Første samtale",
        createdAt: "2024-01-01",
        owner: "A11111",
      },
      {
        id: "456",
        title: "Andre samtale",
        createdAt: "2024-02-02",
        owner: "A11111",
      },
    ])
  }),
  http.get("/bob-api/api/v1/conversations/123/messages", () => {
    return HttpResponse.json([
      {
        id: "aa123",
        content:
          "Dette er første spørsmål i samtalen (med conversationId=123.)",
        createdAt: "2024-01-01",
        feedback: {
          id: "f1",
          liked: false,
          createdAt: "2024-01-01",
        },
        messageType: MessageType.Question,
        messageRole: MessageRole.Human,
        createdBy: "A11111",
        citations: [
          {
            id: "c1",
            text: "text her",
            article: "article her",
            title: "title her",
            section: "section her",
            createdAt: "2024-01-01",
          },
        ],
      },
      {
        id: "bb123",
        content: "Dette er første svar i samtalen (med conversationId=123)",
        createdAt: "2024-01-01",
        feedback: {
          id: "f2",
          liked: false,
          createdAt: "2024-01-01",
        },
        messageType: MessageType.Answer,
        messageRole: MessageRole.AI,
        createdBy: "NKS-Bob",
        citations: [
          {
            id: "c1",
            text: "text her",
            article: "article her",
            title: "title her",
            section: "section her",
            createdAt: "2024-01-01",
          },
        ],
      },
    ])
  }),
  http.get("/bob-api/api/v1/conversations/456/messages", () => {
    return HttpResponse.json([
      {
        id: "cc456",
        content: "Dette er en annen samtale (med conversationId=456)",
        createdAt: "2024-04-04",
        feedback: {
          id: "f1",
          liked: false,
          createdAt: "2024-01-01",
        },
        messageType: MessageType.Question,
        messageRole: MessageRole.Human,
        createdBy: "A11111",
        citations: [
          {
            id: "c1",
            text: "text her",
            article: "article her",
            title: "title her",
            section: "section her",
            createdAt: "2024-04-04",
          },
        ],
      },
      {
        id: "dd456",
        content:
          "Og jeg er NKS-bob sitt svar på spørsmålet (med conversationId=123.)",
        createdAt: "2024-04-04",
        feedback: {
          id: "f2",
          liked: false,
          createdAt: "2024-04-04",
        },
        messageType: MessageType.Answer,
        messageRole: MessageRole.AI,
        createdBy: "NKS-Bob",
        citations: [
          {
            id: "c1",
            text: "text her",
            article: "article her",
            title: "title her",
            section: "section her",
            createdAt: "2024-04-04",
          },
        ],
      },
      {
        id: "ee456",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sit amet eros fermentum eros aliquet placerat eget quis est. Nam blandit lorem at dolor elementum porta. Fusce maximus sem eu elit commodo vulputate.",
        createdAt: "2024-04-04",
        feedback: {
          id: "f1",
          liked: false,
          createdAt: "2024-01-01",
        },
        messageType: MessageType.Question,
        messageRole: MessageRole.Human,
        createdBy: "A11111",
        citations: [
          {
            id: "c1",
            text: "text her",
            article: "article her",
            title: "title her",
            section: "section her",
            createdAt: "2024-04-04",
          },
        ],
      },
      {
        id: "ff456",
        content:
          "Etiam auctor felis massa. Sed auctor, turpis a malesuada laoreet, massa nisi viverra velit, id viverra velit orci quis lorem. Donec pharetra, lacus eget eleifend volutpat, magna erat sagittis risus, et hendrerit ante magna a magna. Suspendisse potenti. Maecenas id molestie magna, eu lacinia dui. Vestibulum aliquet eleifend nulla in congue.\n" +
          "\n" +
          "In hac habitasse platea dictumst. Donec non tincidunt mi, nec placerat neque. Donec et dui mauris. Sed a rhoncus justo. Aenean finibus, nisi sit amet euismod ultricies, lectus ligula scelerisque lectus, a lacinia erat mi ac odio. Maecenas volutpat leo vitae turpis aliquam, eget aliquam sem tincidunt. Sed orci massa, finibus ac facilisis ut, tincidunt porttitor odio. Mauris tincidunt, urna sagittis scelerisque porta, ex sem aliquet libero, sit amet commodo erat dolor vel lectus.",
        createdAt: "2024-04-04",
        feedback: {
          id: "f2",
          liked: false,
          createdAt: "2024-04-04",
        },
        messageType: MessageType.Answer,
        messageRole: MessageRole.AI,
        createdBy: "NKS-Bob",
        citations: [
          {
            id: "c1",
            text: "text her",
            article: "article her",
            title: "title her",
            section: "section her",
            createdAt: "2024-04-04",
          },
        ],
      },
    ])
  }),
]
