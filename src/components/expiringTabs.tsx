import React, { useEffect, useState } from 'react';
import { ExternalLink, Info, Trash, X } from 'lucide-react';

import { MiniTab } from '../utils/types.s';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export default function ExpiringTabs({
  setTabs,
}: {
  setTabs: (tabs: MiniTab[]) => void;
}) {
  const [expTabs, setExpTabs] = useState<MiniTab[]>([]);
  useEffect(() => {
    try {
      chrome.runtime.sendMessage(
        { type: 'REQUEST_EXPIRING_TABS_INFO' },
        (response) => {
          setExpTabs(response.expiringTabs);
        }
      );
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

  const truncateTitle = (title: string, limit: number) =>
    title.length > limit ? `${title.substring(0, limit)}...` : title;

  return (
    <Card className='w-[350px] border-none shadow-none p-4'>
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
      <CardContent>
        <div className='grid w-full items-center gap-2'>
          {expTabs.map((tab) => (
            <div key={tab.url} className='flex items-center space-x-2'>
              <img src={tab.icon} alt='' className='h-4 w-4 flex-shrink-0' />
              <div className='min-w-0 flex-grow'>
                <p className='truncate text-sm' title={tab.title}>
                  {truncateTitle(tab.title, 30)}
                </p>
              </div>
              <div className='flex flex-shrink-0 space-x-1'>
                <button
                  onClick={() => handleDismiss(tab.url)}
                  className='p-1 text-muted-foreground transition-colors duration-200 hover:text-destructive'
                  title='Dismiss'
                  aria-label='Dismiss Tab'
                  type='button'
                >
                  <X size={16} />
                </button>
                <button
                  onClick={() => handleOpen(tab.url)}
                  className='p-1 text-muted-foreground transition-colors duration-200 hover:text-primary'
                  title='Open'
                  aria-label='Open Tab'
                  type='button'
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
          {expTabs.length === 0 && (
            <div className='py-4 text-center text-muted-foreground'>
              <Trash className='mx-auto mb-2 w-12 h-12' />
              <p className='text-sm'>No expiring tabs</p>
            </div>
          )}
        </div>
      </CardContent>
      {expTabs.length > 0 && (
        <CardFooter className='flex justify-between'>
          <Button onClick={handleDismissAll} variant='outline'>
            Dismiss All
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
