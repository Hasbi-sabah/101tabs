import React, { JSX, useEffect, useRef, useState } from 'react';
import humanizeDuration from 'humanize-duration';
import { Archive, ChevronDown, ChevronUp, Info } from 'lucide-react';

import { MiniTab } from '../utils/types.s';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const MAX_TITLE_LENGTH = 45;
const SCROLL_AMOUNT = 1;
const SCROLL_INTERVAL = 5;

export default function MainPopUp({
  tabs,
  expiringTabs,
}: {
  tabs: MiniTab[];
  expiringTabs: MiniTab[];
}): JSX.Element {
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const [isScrollingUp, setIsScrollingUp] = useState<boolean>(false);
  const [isScrollingDown, setIsScrollingDown] = useState<boolean>(false);
  const [showTopButton, setShowTopButton] = useState<boolean>(false);
  const [showBottomButton, setShowBottomButton] = useState<boolean>(false);
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    setShowBottomButton(tabs.length > 8);
  }, [tabs]);
  const handleLinkClick = (url: string) => {
    try {
      chrome.runtime.sendMessage({ type: 'OPEN_TAB', url }, (response) => {
        if (!response.found) {
          if (url.startsWith('chrome://')) {
            chrome.tabs.create({ url });
          } else {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        }
      });
    } catch (e) {
      //pass
    }
  };

  const getExpirationMessage = (expirationTimestamp: number) => {
    const expirationDate = new Date(expirationTimestamp);
    const now = Date.now();
    const duration = expirationDate.getTime() - now;
    if (duration < 0) {
      return 'Expires soon..';
    }
    const humanizedDuration = humanizeDuration(duration, {
      largest: 1,
      round: true,
    });
    return `Expires in ${humanizedDuration}`;
  };

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      setShowTopButton(scrollTop > 0);
      setShowBottomButton(scrollTop + clientHeight < scrollHeight);
    }
  };

  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
  }, []);
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isScrollingUp || isScrollingDown) {
      intervalId = setInterval(() => {
        if (listRef.current) {
          const scrollValue = isScrollingUp ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
          listRef.current.scrollTop += scrollValue;
          handleScroll();
        }
      }, SCROLL_INTERVAL);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isScrollingUp, isScrollingDown]);

  const startScrolling = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      setIsScrollingUp(true);
      setIsScrollingDown(false);
    } else {
      setIsScrollingUp(false);
      setIsScrollingDown(true);
    }
  };

  const stopScrolling = () => {
    setIsScrollingUp(false);
    setIsScrollingDown(false);
  };

  return (
    <div className='container mx-auto max-w-2xl px-4 py-1'>
      {expiringTabs.length > 0 && (
        <h1>you have {expiringTabs.length} tabs expiring in the next 24h!</h1>
      )}
      <div className='flex items-center justify-center space-x-2'>
        <h1 className='mb-4 text-2xl font-bold'>Closed tabs</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className='mb-3 h-4 w-4 text-muted-foreground' />
            </TooltipTrigger>
            <TooltipContent
              side='left'
              className='max-w-[200px] bg-transparent backdrop-blur-md'
            >
              <p>
                The least visited tabs will be automatically closed once you
                exceed your tab limit, and will be saved in this section.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {tabs.length > 0 ? (
        <div className='relative'>
          <div
            className={`absolute left-0 right-0 top-0 z-10 flex h-8 items-center justify-center bg-gradient-to-b from-background to-transparent transition-opacity duration-200 ${
              showTopButton ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            onMouseEnter={() => startScrolling('up')}
            onMouseLeave={stopScrolling}
          >
            <ChevronUp className='h-4 w-4' />
          </div>
          <ul
            ref={listRef}
            className='scrollbar-hide max-h-[318px] space-y-1 overflow-y-auto'
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={handleScroll}
          >
            {tabs.map((tab) => (
              <li
                key={tab.url}
                className='overflow-hidden rounded-lg transition-all duration-200 ease-in-out'
              >
                <button
                  className='w-full text-left'
                  onMouseEnter={() => setHoveredIndex(tab.url)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleLinkClick(tab.url)}
                  tabIndex={0}
                  type='button'
                >
                  <div className='flex items-center bg-background py-2 px-3 hover:bg-slate-700'>
                    <img
                      src={tab.icon}
                      alt=''
                      className='mr-3 h-5 w-5'
                      aria-hidden='true'
                    />
                    {hoveredIndex === tab.url ? (
                      <div className='flex w-full justify-between'>
                        <span
                          className='truncate font-medium'
                          style={{
                            maxWidth: `calc(100% - ${getExpirationMessage(tab.expiration).length}px)`,
                          }}
                        >
                          {tab.title.length >
                          MAX_TITLE_LENGTH -
                            (getExpirationMessage(tab.expiration).length + 5)
                            ? `${tab.title.substring(0, MAX_TITLE_LENGTH - (getExpirationMessage(tab.expiration).length + 5))}...`
                            : tab.title}
                        </span>
                        <span className='ml-2'>
                          {getExpirationMessage(tab.expiration)}
                        </span>
                      </div>
                    ) : (
                      <span className='truncate font-medium'>
                        {tab.title.length > MAX_TITLE_LENGTH
                          ? `${tab.title.substring(0, MAX_TITLE_LENGTH)}...`
                          : tab.title}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div
            className={`absolute bottom-0 left-0 right-0 z-10 flex h-8 items-center justify-center bg-gradient-to-t from-background to-transparent transition-opacity duration-200 ${
              showBottomButton ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            onMouseEnter={() => startScrolling('down')}
            onMouseLeave={stopScrolling}
          >
            <ChevronDown className='h-4 w-4' />
          </div>
        </div>
      ) : (
        <div className='py-8 text-center'>
          <Archive className='mx-auto mb-4 h-16 w-16 text-muted-foreground' />
          <h3 className='mb-2 text-xl font-semibold text-primary'>
            No Removed Tabs
          </h3>
          <p className='text-muted-foreground'>
            Your automatically removed tabs will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
