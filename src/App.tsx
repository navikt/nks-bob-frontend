import PageWrapper from "./components/pagewrapper/PageWrapper.tsx";
import Content from "./components/content/Content.tsx";
import Menu from "./components/menu/Menu.tsx";
import InputField from "./components/inputfield/InputField.tsx";

import Header from './components/header/Header.tsx';

function App() {

  return (
    <div>
        <Header />
        <PageWrapper>
            <Menu />
            <Content />
            <InputField />
        </PageWrapper>
    </div>
  )
}

export default App
