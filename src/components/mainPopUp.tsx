import React, { JSX, useState } from 'react';
import humanizeDuration from 'humanize-duration';
import { TabletSmartphone } from 'lucide-react';
import { MiniTab } from '../utils/types.s';

const MAX_TITLE_LENGTH = 30;
export default function MainPopUp({
  tabs,
  expiringTabs,
}: {
  tabs: MiniTab[];
  expiringTabs: MiniTab[];
}): JSX.Element {
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const handleLinkClick = (url: string) => {
    chrome.runtime.sendMessage({ type: 'OPEN_TAB', url }, (response) => {
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
    if (duration < 0) {
        return 'This tab is expiring soon..'
    }
    const humanizedDuration = humanizeDuration(duration, {
      largest: 1,
      round: true,
    });
    return `This tab will expire in ${humanizedDuration}`;
  };
  return (
    <div className='container mx-auto max-w-2xl p-4'>
      {expiringTabs.length > 0 && (
        <h1>you have {expiringTabs.length} tabs expiring in the next 24h!</h1>
      )}
      <h1 className='text-red mb-4 text-2xl font-bold'>Open Tabs</h1>
      {tabs.length > 0 ? (
        <ul className='space-y-2'>
          {tabs.map((tab) => (
            <li
              key={tab.url}
              className='overflow-hidden rounded-lg border transition-all duration-300 ease-in-out'
            >
              <button
                className='w-full text-left'
                onMouseEnter={() => setHoveredIndex(tab.url)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleLinkClick(tab.url)}
                tabIndex={0}
                type='button'
              >
                <div className='flex items-center bg-background p-3'>
                  <img
                    src={tab.icon}
                    alt=''
                    className='mr-3 h-5 w-5'
                    aria-hidden='true'
                  />
                  <span className='truncate font-medium'>
                    {tab.title.length > MAX_TITLE_LENGTH
                      ? `${tab.title.substring(0, MAX_TITLE_LENGTH)}...`
                      : tab.title}
                  </span>
                </div>
              </button>
              {hoveredIndex === tab.url && (
                <div className='bg-muted p-3'>
                  <p className='mb-2 break-all text-sm text-muted-foreground'>
                    {tab.url}
                  </p>
                  <p>{getExpirationMessage(tab.expiration)}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className='py-8 text-center'>
          <TabletSmartphone className='mx-auto mb-4 h-16 w-16 text-muted-foreground' />
          <h2 className='mb-2 text-xl font-semibold text-primary'>
            No Open Tabs
          </h2>
          <p className='text-muted-foreground'>
            You don&apos;t have any open tabs at the moment. Start browsing to
            see your tabs here!
          </p>
        </div>
      )}
    </div>
  );
}
