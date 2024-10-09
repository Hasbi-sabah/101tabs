import React, { JSX, useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import MainPopUp from '../components/mainPopUp';
import Options from '../components/options';
import { MiniTab } from '../utils/types.s';
import Dialog from '../components/dialog';
import Header from '../components/header';
import ExpiringTabs from '../components/expiringTabs';

export default function Popup(): JSX.Element {
  const [current, setCurrent] = useState<'dialog' | 'main' | 'options' | 'expiring'>("main");
  const [tabs, setTabs] = useState<MiniTab[]>([]);
  const [expiringTabs, setExpiringTabs] = useState<MiniTab[]>([]);
  const [multipleWindows, setMultipleWindows] = useState<boolean>(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'REQUEST_TABS_INFO' }, response => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError.message);
      } else {
        console.log('Popup: received response from background:', response);
        setTabs(response.tabs);
      }
    });
    chrome.runtime.sendMessage({ type: 'REQUEST_IF_MULTIPLE_WINDOWS' }, response => {
      setMultipleWindows(response.multipleWindows);
    })
    const handleMessage = (message: any) => {
      if (message.type === 'EXPIRING_TABS') { setExpiringTabs(message.tabs); setCurrent('dialog'); }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);


  const handleSave = (action: string) => {
    chrome.runtime.sendMessage({ type: 'REQUEST_SAVE_TABS', action }, response => {
      if (response.status === 'success') {
        setTabs(response.newTempList);
        setCurrent('main')
      }
    })
  }
  if (current === 'dialog') {
    return <Dialog handleReview={() => setCurrent('expiring')} expiringTabsLength={expiringTabs.length} />;
  }
  return (
    <div>
      <Header multipleWindows={multipleWindows} current={current} setCurrent={setCurrent} handleSave={handleSave} />
      {current === 'main' && <MainPopUp tabs={tabs} expiringTabs={expiringTabs} />}
      {current === 'options' && <Options handleCancel={() => setCurrent('main')} />}
      {current === 'expiring' && <ExpiringTabs setTabs={setTabs}/>}
    </div>
  )
}
