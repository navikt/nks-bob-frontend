import PageWrapper from "./components/pagewrapper/PageWrapper.tsx";
import Content from "./components/content/Content.tsx";
import Menu from "./components/menu/Menu.tsx";

import Header from './components/header/Header.tsx';

function App() {

  return (
    <div>
        <PageWrapper>
            <Header />
            <Menu />
            <Content />
        </PageWrapper>
    </div>
  )
}

export default App
