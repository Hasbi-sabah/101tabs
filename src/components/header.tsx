import React from "react";
import { Button } from "./ui/button";

export default function Header({ multipleWindows, setCurrent, handleSave }: {
    multipleWindows: boolean;
    setCurrent: (value: 'dialog' | 'main' | 'options' | 'expiring') => void;
    handleSave: (action: string) => void;
}) {
    return (
        <div>
            <Button onClick={() => setCurrent('main')} >main</Button>
            <Button onClick={() => setCurrent('options')}>options</Button>
            <Button onClick={() => setCurrent('expiring')}>expiring</Button>
            <div>
                {multipleWindows && (<Button onClick={() => handleSave('saveAll')}>save all</Button>)}
                <Button onClick={() => handleSave('saveWindow')}>save window</Button>
                <Button onClick={() => handleSave('saveTab')}>save tab</Button>
            </div>
        </div>
    )
}