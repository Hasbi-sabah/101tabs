import React, { useState } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Bookmark, ChevronDown, Clock, FileText, Layout, MoreVertical, Save, Settings } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export default function Header({ multipleWindows, current, setCurrent, handleSave }: {
    multipleWindows: boolean;
    current: 'dialog' | 'main' | 'options' | 'expiring';
    setCurrent: (value: 'dialog' | 'main' | 'options' | 'expiring') => void;
    handleSave: (action: string) => void;
}) {
    return (
        <div className="bg-background p-2 rounded-lg w-[350px]">
            <div className="flex items-center justify-between">
                <Tabs value={current} onValueChange={(value) => setCurrent(value as 'dialog' | 'main' | 'options' | 'expiring')} className="w-[calc(100%-40px)]">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="main" onClick={() => setCurrent('main')}>
                            <Bookmark className="w-4 h-4 mr-2" />
                            Main
                        </TabsTrigger>
                        <TabsTrigger value="expiring" onClick={() => setCurrent('expiring')}>
                            <Clock className="w-4 h-4 mr-2" />
                            Expiring
                        </TabsTrigger>
                        <TabsTrigger value="options" onClick={() => setCurrent('options')}>
                            <Settings className="w-4 h-4 mr-2" />
                            Options
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Save options</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSave('saveTab')}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Save Tab</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSave('saveWindow')}>
                            <Layout className="mr-2 h-4 w-4" />
                            <span>Save Window</span>
                        </DropdownMenuItem>
                        {multipleWindows && (
                            <DropdownMenuItem onClick={() => handleSave('saveAll')}>
                                <Save className="mr-2 h-4 w-4" />
                                <span>Save All Windows</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}