import React, { JSX, useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import MainPopUp from '../components/mainPopUp';
import Options from '../components/options';
import { MiniTab } from '../utils/types.s';
import Dialog from '../components/dialog';

export default function Popup(): JSX.Element {
  const [current, setCurrent] = useState<string>("main");
  const [tabs, setTabs] = useState<MiniTab[]>([]);
  const [expiringTabs, setExpiringTabs] = useState<MiniTab[]>([]);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'REQUEST_TABS_INFO' }, response => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError.message);
      } else {
        console.log('Popup: received response from background:', response);
        setTabs(response.tabs);
      }
    });
    const handleMessage = (message: any) => {
      if (message.type === 'EXPIRING_TABS') {setExpiringTabs(message.tabs); setCurrent('dialog');}
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);    
  }, []);
  const handleCancel = () => {
    setCurrent('main');     
  }
  if (current === 'dialog') {
    return <Dialog handleReview={() => {}} expiringTabsLength={expiringTabs.length} />;
  } 
  return (
    <div>
      <Button onClick={() => setCurrent('main')} >main</Button>
      <Button onClick={() => setCurrent('options')}>options</Button>
      {current === 'main' ? <MainPopUp tabs={tabs} expiringTabs={expiringTabs} /> : <Options handleCancel={handleCancel}/>}
    </div>
  )
}
