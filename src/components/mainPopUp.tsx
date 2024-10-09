import React, { JSX, useState } from 'react';
import { MiniTab } from '../utils/types.s';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../components/ui/hover-card"
import { CalendarIcon, TabletSmartphone } from 'lucide-react';
import humanizeDuration from 'humanize-duration';

const MAX_TITLE_LENGTH = 30
export default function MainPopUp({ tabs, expiringTabs }: { tabs: MiniTab[], expiringTabs: MiniTab[] }): JSX.Element {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const handleLinkClick = (url: string) => {
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
    const getExpirationMessage = (expirationTimestamp: number) => {
        const expirationDate = new Date(expirationTimestamp);
        const now = Date.now();
        const duration = expirationDate.getTime() - now;
        const humanizedDuration = humanizeDuration(duration, { largest: 1, round: true });
        return `This tab will expire in ${humanizedDuration}`;
    };
    return (
        <div className="container p-4 max-w-2xl mx-auto">
            {expiringTabs.length > 0 && (
                <h1>you have {expiringTabs.length} tabs expiring in the next 24h!</h1>
            )}
            <h1 className="text-2xl font-bold mb-4 text-red">Open Tabs</h1>
            {tabs.length > 0 ? (
                <ul className="space-y-2">
                    {tabs.map((tab, index) => (
                        <li
                            key={index}
                            className="border cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ease-in-out"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => handleLinkClick(tab.url)}
                        >
                            <div className="flex items-center p-3 bg-background">
                                <img src={tab.icon} alt="" className="w-5 h-5 mr-3" aria-hidden="true" />
                                <span className="font-medium truncate">
                                    {tab.title.length > MAX_TITLE_LENGTH
                                        ? `${tab.title.substring(0, MAX_TITLE_LENGTH)}...`
                                        : tab.title}
                                </span>
                            </div>
                            {hoveredIndex === index && (
                                <div className="p-3 bg-muted">
                                    <p className="text-sm text-muted-foreground break-all mb-2">{tab.url}</p>
                                    <HoverCard>
                                        <HoverCardTrigger asChild>
                                            <button className="flex items-center text-sm text-primary hover:underline">
                                                <CalendarIcon className="w-4 h-4 mr-1" />
                                                View Expiration
                                            </button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="w-80">
                                            <div className="flex justify-between space-x-4">
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-semibold">Expiration Date</h4>
                                                    <p className="text-sm">
                                                        {getExpirationMessage(tab.expiration)}                                             </p>
                                                </div>
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8">
                    <TabletSmartphone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2 text-primary">No Open Tabs</h2>
                    <p className="text-muted-foreground">
                        You don't have any open tabs at the moment. Start browsing to see your tabs here!
                    </p>
                </div>
            )}
        </div>
    )
}
