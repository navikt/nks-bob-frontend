import Content from "./components/content/Content.tsx";
import Header from "./components/header/Header.tsx";
import PageWrapper from "./components/PageWrapper/PageWrapper.tsx";

function App() {
  return (
    <PageWrapper>
      <Header />
        <Content />
    </PageWrapper>
  )
}

export default App;
