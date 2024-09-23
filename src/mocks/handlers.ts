import { http, HttpResponse } from "msw"

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
]
