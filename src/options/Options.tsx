import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Download, Trash2, Upload } from 'lucide-react';

import { defaultMode } from '../background/index';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { toast } from '../hooks/use-toast';

export default function Options() {
  const [jMode, setJMode] = useState(false);
  const [tabLimit, setTabLimit] = useState(7);
  const [expirationDays, setExpirationDays] = useState(3);
  const [save, setSave] = useState<string>('Save Changes');

  useEffect(() => {
    chrome.storage.local.get(['tabLimit', 'expirationDays'], (result) => {
      setTabLimit(result.tabLimit || 7);
      setExpirationDays(result.expirationDays / (24 * 60 * 60 * 1000) || 3);
      setJMode(result.tabLimit === 3);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    chrome.storage.local.set({
      tabLimit,
      expirationDays: expirationDays * 24 * 60 * 60 * 1000,
    });
    setSave('Saved');
    toast({
      title: 'Settings saved',
      description: 'Your changes have been successfully saved.',
    });
    setTimeout(() => {
      setSave('Save Changes');
    }, 2000);
  };

  const handleExport = () => {
    chrome.storage.local.get(
      {
        tabLimit: defaultMode.tabLimit,
        expirationDays: defaultMode.expirationDays,
        mode: 'default',
        tempList: [],
        expiringTabs: [],
      },
      (result) => {
        const blob = new Blob([JSON.stringify(result)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '101tabs-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    );
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          chrome.runtime.sendMessage(
            { type: 'VALIDATE_IMPORT', data },
            (response) => {
              if (response.status === 'SUCCESS') {
                setTabLimit(response.tabLimit);
                setExpirationDays(
                  response.expirationDays / (24 * 60 * 60 * 1000)
                );
                setJMode(response.mode);
              } else {
                toast({
                  title: 'Import failed',
                  description: 'There was an error importing your settings.',
                  variant: 'destructive',
                });
              }
            }
          );
          toast({
            title: 'Settings imported',
            description: 'Your settings have been successfully imported.',
          });
        } catch (error) {
          toast({
            title: 'Import failed',
            description: 'There was an error importing your settings.',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    }
  };
  const handleDeleteData = () => {
    chrome.storage.local.clear(() => {
      chrome.runtime.sendMessage(
        { type: 'TOGGLE_JULIEN_MODE', julienMode: true },
        (response) => {
          setTabLimit(response.tabLimit);
          setExpirationDays(response.expirationDays / (24 * 60 * 60 * 1000));
          setJMode(false);
        }
      );
      toast({
        title: 'Data deleted',
        description: 'All your data has been successfully deleted.',
      });
    });
  };
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='b-2 pb-10 text-center text-3xl font-bold'>
        101tabs settings
      </h1>

      <form
        onSubmit={handleSubmit}
        className='flex flex-col items-center gap-3 space-y-8'
      >
        {jMode ? (
          <div className='w-[400px] rounded-lg bg-gradient-to-r from-blue-700 via-purple-900 to-red-700 p-1'>
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
                  {/* <AlertTriangle className='mr-2 h-4 w-4 text-yellow-500' /> */}
                  - <span className='font-bold'>&nbsp; Tab Limit:&nbsp;</span> 3
                </li>
                <li className='flex items-center'>
                  {/* <AlertTriangle className='mr-2 h-4 w-4 text-yellow-500' /> */}
                  -{' '}
                  <span className='font-bold'>
                    &nbsp; Expiration of Closed Tabs:
                  </span>
                  &nbsp; 2 mins
                </li>
                <li className='flex items-center'>
                  {/* <AlertTriangle className='mr-2 h-4 w-4 text-yellow-500' /> */}
                  -{' '}
                  <span className='font-bold'>
                    &nbsp; Alarm before deletion: &nbsp;
                  </span>{' '}
                  1 min
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className='grid gap-8 md:grid-cols-2'>
            <div className='space-y-4'>
              <Label htmlFor='tabLimit' className='text-xl font-medium'>
                Tab Limit (5-30)
              </Label>
              <Slider
                id='tabLimit'
                min={5}
                max={30}
                step={1}
                value={[tabLimit]}
                onValueChange={(value) => setTabLimit(value[0])}
                className='w-full'
              />
              <div className='text-lg text-muted-foreground'>
                Current value: {tabLimit} tabs
              </div>
            </div>
            <div className='space-y-4'>
              <Label htmlFor='expirationDays' className='text-xl font-medium'>
                Expiration of Closed Tabs (1-7 days)
              </Label>
              <Slider
                id='expirationDays'
                min={1}
                max={7}
                step={1}
                value={[expirationDays]}
                onValueChange={(value) => setExpirationDays(value[0])}
                className='w-full'
              />
              <div className='text-lg text-muted-foreground'>
                Current value: {expirationDays} day
                {expirationDays > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        <div className='flex flex-col items-center justify-between gap-5'>
          {!jMode && (
            <Button
              onClick={handleSubmit}
              variant={save === 'Saved' ? 'default' : 'default'}
              className={`w-[60%] ${save === 'Saved' ? 'bg-green-500 hover:bg-green-600' : ''}`}
            >
              {save === 'Saved' ? (
                <CheckCircle className='mr-2 h-4 w-4' />
              ) : null}
              {save}
            </Button>
          )}
          <div className='space-x-4'>
            <Button onClick={handleExport} variant='outline'>
              <Upload className='mr-2 h-4 w-4' />
              Export Settings
            </Button>
            <Button variant='outline' className='relative'>
              <input
                type='file'
                onChange={handleImport}
                className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                accept='.json'
              />
              <Download className='mr-2 h-4 w-4' />
              Import Settings
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive'>
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    all your saved data and reset your settings to default.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteData}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </form>
    </div>
  );
}
