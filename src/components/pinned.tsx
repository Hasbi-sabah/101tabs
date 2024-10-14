import React, { useEffect, useState } from 'react';
import { ExternalLink, Info, Pin, PinOff } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from './ui/tooltip';
import { PinnedTab } from '../utils/types.s';
import { Button } from './ui/button';

export default function PinnedTabs() {
  const [currentTab, setCurrentTab] = useState<PinnedTab>({
    title: '',
    url: '',
    icon: '',
  });
  const [pinnedTabs, setPinnedTabs] = useState<PinnedTab[]>([]);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [maxTabs, setMaxTabs] = useState<number>(6);
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
        setPinnedTabs(result.pinnedTabs);
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
  return (
    <div className='rounded-lg bg-background p-4'>
      <div className='flex justify-center space-x-2'>
        <h1 className='mb-4 text-center text-2xl font-bold'>
          Pinned Tabs
          <span className='ml-3 text-sm text-muted-foreground'>
            {pinnedTabs.length}/{maxTabs}
          </span>
        </h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger disabled>
              <Info className='h-4 w-4 text-muted-foreground mb-2' />
            </TooltipTrigger>
            <TooltipContent
              side='right'
              className='max-w-[200px] bg-transparent backdrop-blur-md'
            >
              <p>
                Pinned tabs will not close automatically when tab limit is reached.
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
      {pinnedTabs.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-5 text-muted-foreground'>
          <Pin className='mb-2 h-12 w-12' />
          <p className='text-sm'>No pinned tabs</p>
        </div>
      ) : (
        <ul className='space-y-1'>
          {pinnedTabs.map((tab) => (
            <li key={tab.url} className='flex items-center justify-between'>
              <div className='mr-2 flex min-w-0 flex-grow items-center'>
                <img
                  src={tab.icon}
                  alt=''
                  width={16}
                  height={16}
                  className='mr-2 flex-shrink-0'
                />
                <span className='truncate'>{tab.title}</span>
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handlePinUnpin(tab.url)}
                className='flex-shrink-0 text-muted-foreground hover:text-primary'
              >
                <PinOff className='h-4 w-4' />
                <span className='sr-only'>Unpin tab</span>
              </Button>
              <button
                onClick={() => handleOpen(tab.url)}
                className='p-1 text-muted-foreground transition-colors duration-200 hover:text-primary'
                title='Open'
                aria-label='Open Tab'
                type='button'
              >
                <ExternalLink size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
