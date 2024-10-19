import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Trash,
  X,
} from 'lucide-react';

import { MiniTab } from '../utils/types.s';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const SCROLL_AMOUNT = 1;
const SCROLL_INTERVAL = 5;
export default function ExpiringTabs({
  setTabs,
}: {
  setTabs: (tabs: MiniTab[]) => void;
}) {
  const [expTabs, setExpTabs] = useState<MiniTab[]>([]);
  const [isScrollingUp, setIsScrollingUp] = useState<boolean>(false);
  const [isScrollingDown, setIsScrollingDown] = useState<boolean>(false);
  const [showTopButton, setShowTopButton] = useState<boolean>(false);
  const [showBottomButton, setShowBottomButton] = useState<boolean>(false);
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    setShowBottomButton(expTabs.length > 8);
  }, [expTabs]);
  useEffect(() => {
    try {
      chrome.storage.local.get({ expiringTabs: [] }, (result) => {
        setExpTabs(result.expiringTabs);
      });
    } catch (e) {
      //pass
    }
  }, []);
  const handleDismissAll = () => {
    try {
      chrome.runtime.sendMessage(
        { type: 'DISMISS_ALL_EXPIRING' },
        (response) => {
          setExpTabs([]);
          setTabs(response.tempList);
        }
      );
    } catch (e) {
      //pass
    }
  };

  const handleDismiss = (url: string) => {
    try {
      chrome.runtime.sendMessage(
        { type: 'DISMISS_EXPIRING_TAB', url },
        (response) => {
          setExpTabs(response.expiringTabs);
          setTabs(response.tempList);
        }
      );
    } catch (e) {
      //pass
    }
  };

  const handleOpen = (url: string) => {
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
      <div className='flex items-center justify-center space-x-2'>
        <h1 className='mb-4 text-2xl font-bold'>Expiring Today</h1>
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
                This is the graveyard of tabs, tabs that will expire within 24h
                are held here for you to reopen or dismiss.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {expTabs.length > 0 ? (
        <div className='relative mb-2'>
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
            {expTabs.map((tab) => (
              <li
                key={tab.url}
                className='overflow-hidden rounded-lg transition-all duration-200 ease-in-out'
              >
                  <div className='flex items-center justify-between bg-background px-3 py-2 hover:bg-slate-700'>
                    <div className='flex items-center'>
                      <img
                        src={tab.icon}
                        alt=''
                        className='mr-3 h-5 w-5'
                        aria-hidden='true'
                      />
                      <span className='truncate font-medium'>
                        {tab.title.length > 30
                          ? `${tab.title.substring(0, 30)}...`
                          : tab.title}
                      </span>
                    </div>
                    <div className='flex space-x-1'>
                      <button
                        onClick={() => handleDismiss(tab.url)}
                        className='px-1 text-muted-foreground transition-colors duration-200 hover:text-destructive'
                        title='Dismiss'
                        aria-label='Dismiss Tab'
                        type='button'
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={() => handleOpen(tab.url)}
                        className='px-1 text-muted-foreground transition-colors duration-200 hover:text-primary'
                        title='Open'
                        aria-label='Open Tab'
                        type='button'
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
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
        <div className='py-4 text-center text-muted-foreground'>
          <Trash className='mx-auto mb-2 h-12 w-12' />
          <p className='text-sm'>No expiring tabs</p>
        </div>
      )}
      {expTabs.length > 0 && (
        <Button onClick={handleDismissAll} variant='outline'>
          Dismiss All
        </Button>
      )}
    </div>
  );
}
