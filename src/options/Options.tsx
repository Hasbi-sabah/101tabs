import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Clock,
  Download,
  Info,
  MessageSquare,
  Trash2,
  Upload,
} from 'lucide-react';

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { toast } from '../hooks/use-toast';

export default function Options() {
  const [tabLimit, setTabLimit] = useState(7);
  const [expirationDays, setExpirationDays] = useState(3);
  const [save, setSave] = useState<string>('Save Changes');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['tabLimit', 'expirationDays'], (result) => {
      setTabLimit(result.tabLimit || 7);
      setExpirationDays(result.expirationDays / (24 * 60 * 60 * 1000) || 3);
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
  const handleDeleteData = () => {
    chrome.storage.local.clear(() => {
      setTabLimit(defaultMode.tabLimit);
      setExpirationDays(defaultMode.expirationDays / (24 * 60 * 60 * 1000));
      toast({
        title: 'Data deleted',
        description: 'All your data has been successfully deleted.',
      });
    });
  };

  return (
    <div className='container mx-auto flex min-h-screen max-w-3xl flex-col justify-between px-4 py-8'>
      <div>
        <h1 className='mb-12 text-center text-3xl font-bold'>
          101tabs settings
        </h1>

        <form onSubmit={handleSubmit} className='space-y-12'>
          <div className='grid gap-12'>
            <div className='space-y-6'>
              <div className='flex items-center space-x-2'>
                <Label htmlFor='tabLimit' className='block text-xl font-medium'>
                  Tab Limit (5-30)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger disabled>
                      <Info className='h-4 w-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent
                      side='right'
                      className='max-w-[250px] bg-transparent backdrop-blur-md'
                    >
                      <p>
                        Set the maximum number of tabs you want to keep open per
                        window.
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
                className='w-full'
              />
              <div className='text-lg text-muted-foreground'>
                Current value: {tabLimit} tabs
              </div>
            </div>
            <div className='space-y-6'>
              <div className='flex items-center space-x-2'>
                <Label
                  htmlFor='expirationDays'
                  className='block text-xl font-medium'
                >
                  Expiration of Closed Tabs (1-7 days)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger disabled>
                      <Info className='h-4 w-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent
                      side='right'
                      className='max-w-[250px] bg-transparent pr-2 backdrop-blur-md'
                    >
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
                className='w-full'
              />
              <div className='text-lg text-muted-foreground'>
                Current value: {expirationDays} day
                {expirationDays > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className='flex flex-col items-center gap-8'>
            <Button
              onClick={handleSubmit}
              variant={save === 'Saved' ? 'default' : 'default'}
              className={`w-full max-w-md ${save === 'Saved' ? 'bg-green-500 hover:bg-green-600' : ''}`}
            >
              {save === 'Saved' ? (
                <CheckCircle className='mr-2 h-4 w-4' />
              ) : null}
              {save}
            </Button>

            <div className='flex flex-wrap justify-center gap-4'>
              <Button onClick={handleExport} variant='outline'>
                <Upload className='mr-2 h-4 w-4' />
                Export Data
              </Button>
              <Button variant='outline' className='relative'>
                <input
                  type='file'
                  onChange={handleImport}
                  className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                  accept='.json'
                />
                <Download className='mr-2 h-4 w-4' />
                Import Data
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
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
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
            <Button
              className={`
                w-full max-w-md relative overflow-hidden
                bg-gradient-to-r from-pink-500 to-purple-500
                font-semibold text-white
                transition-all duration-300 ease-in-out
                hover:from-pink-600 hover:to-purple-600
                ${isHovered ? 'scale-105' : ''}
                animate-pulse
              `}
              style={{
                animation: isHovered
                  ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  : 'none',
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() =>
                handleLinkClick(
                  'https://docs.google.com/forms/d/e/1FAIpQLSe1l_BwUPdTOhSduf470Nq-SvRMmsO8Js1c7qZNzePjvXvSAw/viewform'
                )
              }
            >
              <MessageSquare className='mr-2 h-4 w-4' />
              Give Feedback
              <span className='absolute inset-0 origin-left scale-x-0 transform bg-white opacity-25 transition-transform duration-300 group-hover:scale-x-100'></span>
            </Button>
          </div>
        </form>
      </div>
      <footer className='mt-5 text-center text-sm text-muted-foreground'>
        <p>
          made with <span className='text-gray-500'>✨ black magic ✨</span> by{' '}
          <a
            href='https://www.linkedin.com/in/sabahhasbi/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
          >
            Sabah
          </a>{' '}
          and{' '}
          <a
            href='https://www.linkedin.com/in/khougha/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
          >
            Menna
          </a>{' '}
          thanks to
          <a
            href='https://x.com/julienbarbier42'
            target='_blank'
            rel='noopener noreferrer'
          >
            <img
              src='/Julien.png'
              alt='Julien'
              className='mb-1 ml-1 inline h-6 w-5 align-middle'
            />
          </a>
        </p>
      </footer>
    </div>
  );
}
