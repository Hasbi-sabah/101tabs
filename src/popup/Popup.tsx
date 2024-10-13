import React, { JSX, useEffect, useState } from 'react';
import {
  Bookmark,
  Clock,
  FileText,
  Layout,
  MoreVertical,
  Pin,
  Save,
  Settings,
} from 'lucide-react';

import Dialog from '../components/dialog';
import ExpiringTabs from '../components/expiringTabs';
import MainPopUp from '../components/mainPopUp';
import Options from '../components/options';
import PinnedTabs from '../components/pinned';
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
    'dialog' | 'main' | 'options' | 'expiring' | 'pinned'
  >('main');
  const [tabs, setTabs] = useState<MiniTab[]>([]);
  const [pinned, setPinned] = useState([]);
  const [expiringTabs, setExpiringTabs] = useState<MiniTab[]>([]);
  const [multipleWindows, setMultipleWindows] = useState<boolean>(false);
  const [julienMode, setJulienMode] = useState<boolean>(false);
  const [tabLimit, setTabLimit] = useState(7);
  const [expirationDays, setExpirationDays] = useState(3);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'REQUEST_TABS_INFO' }, (response) => {
      setTabs(
        response.tabs.sort(
          (a: MiniTab, b: MiniTab) => a.expiration - b.expiration
        )
      );
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
              setCurrent(
                value as 'dialog' | 'main' | 'options' | 'expiring' | 'pinned'
              )
            }
            className='w-[calc(100%-40px)]'
          >
            <TabsList className='flex w-full'>
              <TabsTrigger
                value='main'
                onClick={() => setCurrent('main')}
                className={`flex-grow transition-all duration-300 ease-in-out ${current === 'main' ? 'px-4' : 'px-2'}`}
              >
                <Bookmark
                  className={`h-4 w-4 ${current === 'main' ? 'mr-2' : ''}`}
                />
                {current === 'main' && 'Main'}
              </TabsTrigger>
              <TabsTrigger
                value='pinned'
                onClick={() => setCurrent('pinned')}
                className={`flex-grow transition-all duration-300 ease-in-out ${current === 'pinned' ? 'px-4' : 'px-2'}`}
              >
                <Pin
                  className={`h-4 w-4 ${current === 'pinned' ? 'mr-2' : ''}`}
                />
                {current === 'pinned' && 'Pinned'}
              </TabsTrigger>
              <TabsTrigger
                value='expiring'
                onClick={() => setCurrent('expiring')}
                className={`flex-grow transition-all duration-300 ease-in-out ${current === 'expiring' ? 'px-4' : 'px-2'}`}
              >
                <Clock
                  className={`h-4 w-4 ${current === 'expiring' ? 'mr-2' : ''}`}
                />
                {current === 'expiring' && 'Expiring'}
              </TabsTrigger>
              <TabsTrigger
                value='options'
                onClick={() => setCurrent('options')}
                className={`flex-grow transition-all duration-300 ease-in-out ${current === 'options' ? 'px-4' : 'px-2'}`}
              >
                <Settings
                  className={`h-4 w-4 ${current === 'options' ? 'mr-2' : ''}`}
                />
                {current === 'options' && 'Settings'}
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
      {current === 'pinned' && <PinnedTabs />}
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
