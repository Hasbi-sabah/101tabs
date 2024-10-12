import React, { JSX, useEffect, useState } from 'react';
import {
  Bookmark,
  Clock,
  FileText,
  Layout,
  MoreVertical,
  Save,
  Settings,
} from 'lucide-react';

import Dialog from '../components/dialog';
import ExpiringTabs from '../components/expiringTabs';
import MainPopUp from '../components/mainPopUp';
import Options from '../components/options';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MiniTab } from '../utils/types.s';

export default function Popup(): JSX.Element {
  const [current, setCurrent] = useState<
    'dialog' | 'main' | 'options' | 'expiring'
  >('main');
  const [tabs, setTabs] = useState<MiniTab[]>([]);
  const [expiringTabs, setExpiringTabs] = useState<MiniTab[]>([]);
  const [multipleWindows, setMultipleWindows] = useState<boolean>(false);
  const [julienMode, setJulienMode] = useState<boolean>(false);
  const [tabLimit, setTabLimit] = useState(7);
  const [expirationDays, setExpirationDays] = useState(3);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'REQUEST_TABS_INFO' }, (response) => {
      setTabs(response.tabs.sort((a: MiniTab, b: MiniTab) => a.expiration - b.expiration));
    });
    chrome.runtime.sendMessage(
      { type: 'REQUEST_IF_MULTIPLE_WINDOWS' },
      (response) => {
        setMultipleWindows(response.multipleWindows);
      }
    );
    const handleMessage = (message: { type: string; tabs: MiniTab[] }) => {
      if (message.type === 'EXPIRING_TABS') {
        setExpiringTabs(message.tabs);
        setCurrent('dialog');
      } else if (message.type === 'FIRST_INSTALL') {
        setCurrent('options');
      }
    };
    chrome.storage.local.get({ tabLimit: 7 }, (result) => {
      setJulienMode(result.tabLimit === 3);
    });
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const handleJulienMode = () => {
    chrome.runtime.sendMessage(
      { type: 'TOGGLE_JULIEN_MODE', julienMode },
      (response) => {
        setTabLimit(response.tabLimit);
        setExpirationDays(response.expirationDays / (24 * 60 * 60 * 1000));
        setJulienMode(!julienMode);
        setCurrent('options');
      }
    );
  };

  const handleSave = (action: string) => {
    chrome.runtime.sendMessage(
      { type: 'REQUEST_SAVE_TABS', action },
      (response) => {
        if (response.status === 'success') {
          setTabs(response.newTempList);
          setCurrent('main');
        }
      }
    );
  };
  if (current === 'dialog') {
    return (
      <Dialog
        handleReview={() => setCurrent('expiring')}
        expiringTabsLength={expiringTabs.length}
      />
    );
  }
  return (
    <div>
      <div className='w-[350px] rounded-lg bg-background p-2'>
        <div className='flex items-center justify-between'>
          <Tabs
            value={current}
            onValueChange={(value) =>
              setCurrent(value as 'dialog' | 'main' | 'options' | 'expiring')
            }
            className='w-[calc(100%-40px)]'
          >
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='main' onClick={() => setCurrent('main')}>
                <Bookmark className='mr-2 h-4 w-4' />
                Main
              </TabsTrigger>
              <TabsTrigger
                value='expiring'
                onClick={() => setCurrent('expiring')}
              >
                <Clock className='mr-2 h-4 w-4' />
                Expiring
              </TabsTrigger>
              <TabsTrigger
                value='options'
                onClick={() => setCurrent('options')}
              >
                <Settings className='mr-2 h-4 w-4' />
                Options
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <MoreVertical className='h-4 w-4' />
                <span className='sr-only'>Save options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleSave('saveTab')}>
                <FileText className='mr-2 h-4 w-4' />
                <span>Save Tab</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSave('saveWindow')}>
                <Layout className='mr-2 h-4 w-4' />
                <span>Save Window</span>
              </DropdownMenuItem>
              {multipleWindows && (
                <DropdownMenuItem onClick={() => handleSave('saveAll')}>
                  <Save className='mr-2 h-4 w-4' />
                  <span>Save All Windows</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleJulienMode}>
                <img src='/Julien.png' alt='Julien' className='mr-2 h-6 w-5' />
                <span>
                  {julienMode
                    ? 'Deactivate Julien Mode'
                    : 'Activate Julien Mode'}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {current === 'main' && (
        <MainPopUp tabs={tabs} expiringTabs={expiringTabs} />
      )}
      {current === 'options' && (
        <Options
          julienMode={julienMode}
          tabLimit={tabLimit}
          expirationDays={expirationDays}
          handleCancel={() => setCurrent('main')}
          setJulienMode={setJulienMode}
          setTabLimit={setTabLimit}
          setExpirationDays={setExpirationDays}
        />
      )}
      {current === 'expiring' && <ExpiringTabs setTabs={setTabs} />}
    </div>
  );
}
