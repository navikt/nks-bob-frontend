import Content from "./components/content/Content.tsx";
import Header from "./components/header/Header.tsx";
import PageWrapper from "./components/PageWrapper/PageWrapper.tsx";

const conversationId = "6cf0b651-e5f1-4148-a2e1-9634e6cfa29e";

function App() {
  return (
    <PageWrapper>
      <Header />
      <Content conversationId={conversationId} />
    </PageWrapper>
  );
}

export default App;
