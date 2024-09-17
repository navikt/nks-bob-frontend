import { useParams } from "react-router-dom";
import Content from "./components/content/Content.tsx";
import Header from "./components/header/Header.tsx";
import PageWrapper from "./components/PageWrapper/PageWrapper.tsx";

function Samtale() {
  const { conversationId } = useParams();
  return (
    <PageWrapper>
      <Header />
      <Content conversationId={conversationId!} />
    </PageWrapper>
  );
}

export default Samtale;
