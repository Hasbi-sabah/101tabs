import React, { JSX, useEffect, useState } from 'react';
import { MiniTab } from '../utils/types.s';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../components/ui/hover-card"
import { CalendarIcon } from 'lucide-react';

const MAX_TITLE_LENGTH = 30
export default function Popup(): JSX.Element {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tabs, setTabs] = useState<MiniTab[]>([]);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'REQUEST_TABS_INFO' }, response => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError.message);
      } else {
        console.log('Popup: received response from background:', response);
        setTabs(response.tabs);
      }
    });
  }, []);
  return (
    <div className="container p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-red">Open Tabs</h1>
      <ul className="space-y-2">
        {tabs.map((tab, index) => (
          <li
            key={index}
            className="border rounded-lg overflow-hidden transition-all duration-300 ease-in-out"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
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
                          This tab will expire on: {new Date(tab.expiration).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
