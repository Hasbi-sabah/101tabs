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

  
  const handleSaveAll = () => {
    chrome.runtime.sendMessage({ type: 'REQUEST_SAVE_TABS', action: 'saveAll' }, response => {
      if (response.status === 'success') {
        setTabs(response.newTempList);
      }
    })
  }  
  const handleSaveWindow = () => {
    chrome.runtime.sendMessage({ type: 'REQUEST_SAVE_TABS', action: 'saveWindow' }, response => {
      if (response.status === 'success') {
        setTabs(response.newTempList);
      }
    })
  }
  const handleSaveTab = () => {
    chrome.runtime.sendMessage({ type: 'REQUEST_SAVE_TABS', action: 'saveTab' }, response => {
      if (response.status === 'success') {
        setTabs(response.newTempList);
      }
    })
  }
  if (current === 'dialog') {
    return <Dialog handleReview={() => { }} expiringTabsLength={expiringTabs.length} />;
  }
  return (
    <div>
      <Button onClick={() => setCurrent('main')} >main</Button>
      <Button onClick={() => setCurrent('options')}>options</Button>
      <div>
        {multipleWindows && (<Button onClick={handleSaveAll}>save all</Button>)}
        <Button onClick={handleSaveWindow}>save window</Button>
        <Button onClick={handleSaveTab}>save tab</Button>
      </div>
      {current === 'main' ? <MainPopUp tabs={tabs} expiringTabs={expiringTabs} /> : <Options handleCancel={() => setCurrent('main')} />}
    </div>
  )
}
