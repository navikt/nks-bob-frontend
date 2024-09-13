import { HistorikkButton, NewButton } from "./Buttons.tsx";
import './Menu.css';

interface MenuProps {
    onNewChatClick: () => void
}

function Menu( {onNewChatClick}: MenuProps ) {

    return (
        <div className="fixed-menu">
            <div className="flex gap-2 justify-end">
            <HistorikkButton />
            <NewButton newChatClick={onNewChatClick} />
            </div>
        </div>
    )
}

export default Menu