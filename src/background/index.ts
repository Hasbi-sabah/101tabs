import { MiniTab } from "../utils/types.s";

const icons: { [key: string]: string } = {
    "chrome://whats-new": "/whatsnew.png",
    "chrome://extensions": "/puzzle.png",
    "chrome://bookmarks": "/bookmark.png",
    "chrome://downloads": "/download.png",
    "chrome://flags": "/flags.png",
    "chrome://history": "/history.png",
    "chrome://password-manager": "/passwords.png",
    "chrome://settings": "/settings.png"
}
function getIconForUrl(url: string | undefined): string {
    if (!url) {
        return '/fallback.png'
    }
    for (const [prefix, icon] of Object.entries(icons)) {
        if (url.startsWith(prefix)) {
            return icon;
        }
    }
    return '/fallback.png';
}
// function getTimeUntilNextDay() {
//     const now = new Date();
//     const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
//     return nextDay.getTime() - now.getTime();
// }
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.type === 'REQUEST_TABS_INFO') {
        chrome.storage.local.get({ tempList: [] }, (result) => {
            console.log(result)
            sendResponse({ type: 'TABS_INFO', tabs: result.tempList || [] });
        });
        return true;
    }
});

chrome.tabs.onCreated.addListener((tab) => {
    chrome.tabs.query({ windowId: tab.windowId }, async (tabs) => {
        const { tabLimit, expirationDate } = await chrome.storage.local.get(["tabLimit", "expirationDays"]);
        if (tabs.length > tabLimit) {
            let leastVisitedTab = tabs[0];
            tabs.forEach((t) => {
                if (t.id !== tab.id && t.lastAccessed !== undefined && (leastVisitedTab.lastAccessed === undefined || t.lastAccessed < leastVisitedTab.lastAccessed)) {
                    leastVisitedTab = t;
                }
            });
            if (leastVisitedTab.id !== undefined) {
                chrome.tabs.remove(leastVisitedTab.id);
                if (leastVisitedTab.url === 'chrome://newtab/') {
                    return;
                }
                const removedTabInfo = {
                    title: leastVisitedTab.title || 'No title',
                    url: leastVisitedTab.url || '',
                    icon: leastVisitedTab.favIconUrl || getIconForUrl(leastVisitedTab.url),
                    expiration: Date.now() + expirationDate
                }
                chrome.storage.local.get({ tempList: [] }, (result) => {
                    console.log(result)
                    const removedTabs = result.tempList || [];
                    const existingTabIndex = removedTabs.findIndex((tab: MiniTab) => tab.url === removedTabInfo.url);

                    if (existingTabIndex !== -1) {
                        removedTabs[existingTabIndex] = removedTabInfo;
                    } else {
                        removedTabs.push(removedTabInfo);
                    }
                    chrome.storage.local.set({ tempList: removedTabs });
                });
            }
        }
    });
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ tempList: [], tabLimit: 7, expirationDays: 3 * 24 * 60 * 60 * 1000 })
    chrome.alarms.create('dailyJob', {
        when: Date.now(),
        periodInMinutes: 24 * 60
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyJob') {
        chrome.storage.local.get({ tempList: [] }, (result) => {
            const tabs = result.tempList || [];
            const expiringTabs = tabs.filter((tab: MiniTab) => tab.expiration && new Date(tab.expiration).getTime() < (Date.now() + 60 * 1000));
            if (expiringTabs.length > 0) {
                chrome.action.openPopup(() => {
                    if (chrome.runtime.lastError) {
                        console.error('Failed to open popup:', chrome.runtime.lastError);
                    } else {
                        console.log('Popup opened successfully.');
                        chrome.runtime.sendMessage({
                            type: 'EXPIRING_TABS',
                            tabs: expiringTabs
                        });
                    }
                });
            }
        })
    }
})
