import PageWrapper from "./components/pagewrapper/PageWrapper.tsx";
import Content from "./components/content/Content.tsx";

import Header from "./components/header/Header.tsx";

function App() {
  return (
    <div>
      <Header />
      <PageWrapper>
        <Content />
      </PageWrapper>
    </div>
  );
}

export default App;
