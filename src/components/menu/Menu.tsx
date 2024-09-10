import { HistorikkButton, NewButton } from "./Buttons.tsx";
import './Menu.css';

function Menu() {
    return (
        <div className="fixed-menu">
            <div className="flex gap-2 justify-end">
            <HistorikkButton />
            <NewButton />
            </div>
        </div>
    )
}

export default Menu