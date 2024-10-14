import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Info } from 'lucide-react';

import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export default function Options({
  julienMode,
  tabLimit,
  expirationDays,
  handleCancel,
  setJulienMode,
  setTabLimit,
  setExpirationDays,
}: {
  julienMode: boolean;
  tabLimit: number;
  expirationDays: number;
  handleCancel: (value: 'dialog' | 'main' | 'options' | 'expiring') => void;
  setJulienMode: (value: boolean) => void;
  setTabLimit: (value: number) => void;
  setExpirationDays: (value: number) => void;
}) {
  const [save, setSave] = useState<string>('Save Changes');

  useEffect(() => {
    try {
      chrome.storage.local.get(['tabLimit', 'expirationDays'], (result) => {
        setTabLimit(result.tabLimit || 7);
        setExpirationDays(result.expirationDays / (24 * 60 * 60 * 1000) || 3);
        setJulienMode(result.tabLimit === 3);
      });
    } catch (e) {
      //pass
    }
  }, []);
  const handleSubmit = (e: React.FormEvent) => {
    try {
      e.preventDefault();
      chrome.storage.local.set({
        tabLimit,
        expirationDays: expirationDays * 24 * 60 * 60 * 1000,
      });
      setSave('Saved');
      setTimeout(() => {
        handleCancel('main');
      }, 1000);
    } catch (e) {
      //pass
    }
  };
  return (
    <Card className='w-[350px] border-none shadow-none'>
      <CardHeader className='p-4'>
        <CardTitle className='text-2xl font-bold text-center'>
          Set your preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className='space-y-6'>
            {julienMode ? (
              <div className='rounded-lg bg-gradient-to-r from-blue-700 via-purple-900 to-red-700 p-1'>
                <div className='bg-blue rounded-lg p-4'>
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-6 w-6 text-purple-500' />
                    <h3 className='text-lg font-semibold text-yellow-200'>
                      Julien Mode Activated
                    </h3>
                  </div>
                  <p className='mt-2 text-sm text-gray-300'>
                    For those lacking basic time travel abilities:
                  </p>
                  <ul className='mt-2 space-y-1 text-sm text-gray-300'>
                    <li className='flex items-center'>
                      -
                      <span className='font-bold'>&nbsp; Tab Limit:&nbsp;</span>
                      3
                    </li>
                    <li className='flex items-center'>
                      -
                      <span className='font-bold'>
                        &nbsp; Expiration of Closed Tabs:
                      </span>
                      &nbsp; 2 mins
                    </li>
                    <li className='flex items-center'>
                      -
                      <span className='font-bold'>
                        &nbsp; Alarm before deletion: &nbsp;
                      </span>
                      1 min
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div className='space-y-3'>
                  <div className='flex items-center space-x-2'>
                    <Label htmlFor='tabLimit' className='text-base font-medium'>
                      Tab Limit (5-30)
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger disabled>
                          <Info className='h-4 w-4 text-muted-foreground' />
                        </TooltipTrigger>
                        <TooltipContent side='right' className='max-w-[150px] bg-transparent backdrop-blur-md'>
                          <p>
                            Set the maximum number of tabs you want to keep open per window.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Slider
                    id='tabLimit'
                    min={5}
                    max={30}
                    step={1}
                    value={[tabLimit]}
                    onValueChange={(value) => setTabLimit(value[0])}
                  />
                  <div className='text-sm text-muted-foreground'>
                    Current value: {tabLimit} tabs
                  </div>
                </div>
                <div className='space-y-3'>
                  <div className='flex items-center space-x-2'>
                    <Label
                      htmlFor='expirationDays'
                      className='text-base font-medium'
                    >
                      Expiration of Closed Tabs (1-7 days)
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger disabled>
                          <Info className='h-4 w-4 text-muted-foreground' />
                        </TooltipTrigger>
                        <TooltipContent side='right' className='pr-2 max-w-[200px] bg-transparent backdrop-blur-md'>
                          <p>
                            Set how long automatically closed tabs will be saved
                            before being permanently deleted.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Slider
                    id='expirationDays'
                    min={1}
                    max={7}
                    step={1}
                    value={[expirationDays]}
                    onValueChange={(value) => setExpirationDays(value[0])}
                  />
                  <div className='text-sm text-muted-foreground'>
                    Current value: {expirationDays} day
                    {expirationDays > 1 ? 's' : ''}
                  </div>
                </div>
              </>
            )}
          </div>
        </form>
      </CardContent>
      {!julienMode && (
        <CardFooter className='flex justify-between'>
          <Button onClick={() => handleCancel('main')} variant='outline'>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={julienMode}
            variant={save === 'Saved' ? 'default' : 'default'}
            className={
              save === 'Saved' ? 'bg-green-500 hover:bg-green-600' : ''
            }
          >
            {save === 'Saved' ? <CheckCircle className='mr-2 h-4 w-4' /> : null}
            {save}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
