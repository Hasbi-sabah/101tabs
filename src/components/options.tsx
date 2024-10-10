import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

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
    chrome.storage.local.get(['tabLimit', 'expirationDays'], (result) => {
      setTabLimit(result.tabLimit || 7);
      setExpirationDays(result.expirationDays / (24 * 60 * 60 * 1000) || 3);
      setJulienMode(result.tabLimit === 3);
    });
  }, []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    chrome.storage.local.set({
      tabLimit,
      expirationDays: expirationDays * 24 * 60 * 60 * 1000,
    });
    setSave('Saved');
    setTimeout(() => {
      handleCancel('main');
    }, 1000);
  };
  return (
    <Card className='w-[350px] border-none'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>
          Tab Manager Options
        </CardTitle>
        <CardDescription>
          Configure your tab management preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className='space-y-6'>
            {julienMode ? (
              <div className='rounded-lg bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-1'>
                <div className='rounded-lg bg-white p-4'>
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-6 w-6 text-purple-500' />
                    <h3 className='text-lg font-semibold text-purple-700'>
                      Julien Mode Activated
                    </h3>
                  </div>
                  <p className='mt-2 text-sm text-gray-600'>
                    For those lacking basic time travel abilities:
                  </p>
                  <ul className='mt-2 space-y-1 text-sm text-gray-600'>
                    <li className='flex items-center'>
                      <AlertTriangle className='mr-2 h-4 w-4 text-yellow-500' />
                      Tab Limit: 3
                    </li>
                    <li className='flex items-center'>
                      <AlertTriangle className='mr-2 h-4 w-4 text-yellow-500' />
                      Expiration of Closed Tabs: 2 mins
                    </li>
                    <li className='flex items-center'>
                      <AlertTriangle className='mr-2 h-4 w-4 text-yellow-500' />
                      Alarm before deletion: 1 min
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div className='space-y-3'>
                  <Label htmlFor='tabLimit' className='text-base font-medium'>
                    Tab Limit (5-30)
                  </Label>
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
                  <Label
                    htmlFor='expirationDays'
                    className='text-base font-medium'
                  >
                    Expiration of Closed Tabs (1-7 days)
                  </Label>
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
