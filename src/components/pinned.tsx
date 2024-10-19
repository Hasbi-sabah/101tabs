import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Pin,
  PinOff,
} from 'lucide-react';

import { defaultMode } from '../background';
import { PinnedTab } from '../utils/types.s';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const SCROLL_AMOUNT = 1;
const SCROLL_INTERVAL = 5;
export default function PinnedTabs() {
  const [currentTab, setCurrentTab] = useState<PinnedTab>({
    title: '',
    url: '',
    icon: '',
  });
  const [pinnedTabs, setPinnedTabs] = useState<PinnedTab[]>([]);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [maxTabs, setMaxTabs] = useState<number>(defaultMode.tabLimit - 1);
  const [isScrollingUp, setIsScrollingUp] = useState<boolean>(false);
  const [isScrollingDown, setIsScrollingDown] = useState<boolean>(false);
  const [showTopButton, setShowTopButton] = useState<boolean>(false);
  const [showBottomButton, setShowBottomButton] = useState<boolean>(false);
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    setShowBottomButton(pinnedTabs.length > 8);
  }, [pinnedTabs]);
  useEffect(() => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          const tab = tabs[0];
          setCurrentTab({
            title: tab.title || '',
            url: tab.url || '',
            icon: tab.favIconUrl || '',
          });
        }
      });
      chrome.storage.local.get({ pinnedTabs: [], tabLimit: 7 }, (result) => {
        setPinnedTabs(result.pinnedTabs.slice(0, result.tabLimit - 1));
        setMaxTabs(result.tabLimit - 1);
      });
    } catch (e) {
      //pass
    }
  }, []);
  useEffect(() => {
    setIsPinned(
      pinnedTabs.some((tab: PinnedTab) => tab.url === currentTab.url)
    );
  }, [currentTab, pinnedTabs]);
  const handlePinUnpin = (url: string) => {
    try {
      const tabIndex = pinnedTabs.findIndex(
        (tab: PinnedTab) => tab.url === url
      );
      if (tabIndex > -1) {
        const tabs = [...pinnedTabs];
        tabs.splice(tabIndex, 1);
        chrome.storage.local.set({ pinnedTabs: tabs }, () =>
          setPinnedTabs(tabs)
        );
      } else {
        if (currentTab) {
          chrome.runtime.sendMessage(
            { type: 'PIN_TAB', currentTab },
            (response) => {
              setPinnedTabs(response.pinnedTabs);
            }
          );
        }
      }
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
        <h1 className='mb-4 text-2xl font-bold'>
          Pinned Tabs
          <span className='ml-3 text-sm text-muted-foreground'>
            {pinnedTabs.length}/{maxTabs}
          </span>
        </h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger disabled>
              <Info className='mb-2 h-4 w-4 text-muted-foreground' />
            </TooltipTrigger>
            <TooltipContent
              side='right'
              className='max-w-[200px] bg-transparent backdrop-blur-md'
            >
              <p>
                Pinned tabs will not close automatically when tab limit is
                reached.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Button
        className='mb-4 w-full transition-colors duration-200 ease-in-out'
        variant={isPinned ? 'secondary' : 'default'}
        onClick={() => handlePinUnpin(currentTab.url)}
        disabled={!isPinned && pinnedTabs.length === maxTabs}
      >
        {isPinned ? (
          <>
            <PinOff className='mr-2 h-4 w-4' /> Unpin Current Tab
          </>
        ) : (
          <>
            <Pin className='mr-2 h-4 w-4' /> Pin Current Tab
          </>
        )}
      </Button>
      {pinnedTabs.length > 0 ? (
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
            {pinnedTabs.map((tab) => (
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
                      onClick={() => handlePinUnpin(tab.url)}
                      className='px-1 text-muted-foreground transition-colors duration-200 hover:text-destructive'
                      title='Pin'
                      aria-label='Pin Unpin'
                      type='button'
                    >
                      <PinOff size={16} />
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
        <div className='flex flex-col items-center justify-center py-5 text-muted-foreground'>
          <Pin className='mb-2 h-12 w-12' />
          <p className='text-sm'>No pinned tabs</p>
        </div>
      )}
    </div>
  );
}
