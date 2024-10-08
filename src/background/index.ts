import { MiniTab } from "../../../extension/real-ext/src/utils/types.s";

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
    for (const prefix in icons) {
        if (url.startsWith(prefix)) {
            return icons[prefix];
        }
    }
    return '/fallback.png'; // Return undefined if no match is found
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.type === 'REQUEST_TABS_INFO') {
        chrome.storage.local.get({ tempList: [] }, (result) => {
            console.log(result)
            sendResponse({ type: 'TABS_INFO', tabs: result.tempList || [] });
        });
        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});

chrome.tabs.onCreated.addListener((tab) => {
    chrome.tabs.query({ windowId: tab.windowId }, (tabs) => {
        const MAX_TABS = 3;
        const EXP = 2 * 24 * 60 * 60 * 1000;
        if (tabs.length > MAX_TABS) {
            let leastVisitedTab = tabs[0];
            tabs.forEach((t) => {
                if (t.id !== tab.id && t.lastAccessed !== undefined && (leastVisitedTab.lastAccessed === undefined || t.lastAccessed < leastVisitedTab.lastAccessed)) {
                    leastVisitedTab = t;
                }
            });
            if (leastVisitedTab.id !== undefined) {
                chrome.tabs.remove(leastVisitedTab.id);
                const removedTabInfo = {
                    title: leastVisitedTab.title || 'No title',
                    url: leastVisitedTab.url || '',
                    icon: leastVisitedTab.favIconUrl || getIconForUrl(leastVisitedTab.url),
                    expiration: Date.now() + EXP
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
    chrome.storage.local.set({ tempList: [] }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error resetting tempList:', chrome.runtime.lastError);
        } else {
            console.log('tempList has been reset.');
        }
    });
});