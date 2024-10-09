import { X, ExternalLink, Trash } from "lucide-react"
import React, { useEffect, useState } from "react"
import { MiniTab } from "../utils/types.s"
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card"

export default function ExpiringTabs({ setTabs }: { setTabs: (tabs: MiniTab[]) => void }) {
    const [expTabs, setExpTabs] = useState<MiniTab[]>([])
    useEffect(() => {
        chrome.runtime.sendMessage({ type: 'REQUEST_EXPIRING_TABS_INFO' }, response => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError.message);
            } else {
                console.log('Popup: received response from background:', response);
                setExpTabs(response.expiringTabs);
            }
        });
    }, [])
    const handleDismissAll = () => {
        chrome.runtime.sendMessage({ type: 'DISMISS_ALL_EXPIRING' }, response => {
            setExpTabs([])
            setTabs(response.tempList)
        })
    }

    const handleDismiss = (url: string) => {
        chrome.runtime.sendMessage({ type: 'DISMISS_EXPIRING_TAB', url }, response => {
            setExpTabs(response.expiringTabs)
            setTabs(response.tempList)
        })
    }

    const handleOpen = (url: string) => {
        chrome.runtime.sendMessage({ type: 'OPEN_TAB', url }, response => {
            if (!response.found) {
                if (url.startsWith('chrome://')) {
                    chrome.tabs.create({ url });
                } else {
                    window.open(url, '_blank', 'noopener,noreferrer');
                }
            }
        });

    };

    const truncateTitle = (title: string, limit: number) => {
        return title.length > limit ? title.substring(0, limit) + '...' : title
    }

    return (
        <Card className="w-[350px] border-none shadow-none">
            <CardHeader>
                <CardTitle>Expiring Today</CardTitle>
                <CardDescription>Tabs that will expire at the end of the day</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-2">
                    {expTabs.map((tab) => (
                        <div key={tab.url} className="flex items-center space-x-2">
                            <img src={tab.icon} alt="" className="w-4 h-4 flex-shrink-0" />
                            <div className="flex-grow min-w-0">
                                <p className="text-sm truncate" title={tab.title}>
                                    {truncateTitle(tab.title, 30)}
                                </p>
                            </div>
                            <div className="flex space-x-1 flex-shrink-0">
                                <button
                                    onClick={() => handleDismiss(tab.url)}
                                    className="p-1 text-muted-foreground hover:text-destructive transition-colors duration-200"
                                    title="Dismiss"
                                >
                                    <X size={16} />
                                </button>
                                <button
                                    onClick={() => handleOpen(tab.url)}
                                    className="p-1 text-muted-foreground hover:text-primary transition-colors duration-200"
                                    title="Open"
                                >
                                    <ExternalLink size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {expTabs.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                            <Trash className="mx-auto mb-2" size={24} />
                            <p>No expiring tabs</p>
                        </div>
                    )}
                </div>
            </CardContent>
            {expTabs.length > 0 && (
                <CardFooter className="flex justify-between">
                    <Button onClick={handleDismissAll} variant="outline">Dismiss All</Button>
                </CardFooter>)}
        </Card>
    )
}