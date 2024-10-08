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
function addToTempList(tabs: MiniTab[], callback?: (response: any) => void) {
    chrome.storage.local.get({ tempList: [] }, (result) => {
        const existingTabs: MiniTab[] = result.tempList;
        const tabMap = new Map(existingTabs.map(tab => [tab.url, tab]));
        tabs.forEach(newTab => {
            if (newTab.url === 'chrome://newtab/') {
                return;
            }
            if (tabMap.has(newTab.url)) {
                const existingTab = tabMap.get(newTab.url)!;
                existingTab.expiration = Date.now() + 2 * 60 * 1000;
            } else {
                tabMap.set(newTab.url, newTab);
            }
        });
        const updatedTempList = Array.from(tabMap.values());
        chrome.storage.local.set({ tempList: updatedTempList }, () => {
            if (callback) {
                callback({ status: 'success', newTempList: updatedTempList });
            }
        }
        );
    });
}
// function getTimeUntilNextDay() {
//     const now = new Date();
//     const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
//     return nextDay.getTime() - now.getTime();
// }

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ expiringTabs: [], tempList: [], tabLimit: 7, expirationDays: 3 * 24 * 60 * 60 * 1000 })
    chrome.alarms.create('dailyJob', {
        when: Date.now(),
        periodInMinutes: 1
        // periodInMinutes: 24 * 60
    });
    chrome.contextMenus.create({
        id: "save-tab",
        title: "Save this tab",
        contexts: ["page"]
    });   
    chrome.contextMenus.create({
        id: "save-window",
        title: "Save tabs of this window",
        contexts: ["page"]
    });    
    chrome.contextMenus.create({
        id: "save-all",
        title: "Save tabs of all windows",
        contexts: ["page"]
    });
});
chrome.contextMenus.onClicked.addListener((info) => {
    let queryParams = {}
    if (info.menuItemId === 'save-window') queryParams = { currentWindow: true };
    else if (info.menuItemId === 'save-tab') queryParams = { active: true, currentWindow: true };
    chrome.tabs.query(queryParams, (tabs) => {
        const tabInfos: MiniTab[] = tabs.map(tab => ({
            title: tab.title!,
            url: tab.url!,
            icon: tab.favIconUrl || getIconForUrl(tab.url),
            expiration: Date.now() + 3 * 24 * 60 * 60 * 1000
        }));
        addToTempList(tabInfos);
    })
});
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.type === 'REQUEST_TABS_INFO') {
        chrome.storage.local.get({ tempList: [] }, (result) => {
            sendResponse({ type: 'TABS_INFO', tabs: result.tempList || [] });
        });
    } else if (message.type === 'REQUEST_SAVE_TABS') {
        let queryParams = {}
        if (message.action === 'saveWindow') queryParams = { currentWindow: true };
        else if (message.action === 'saveTab') queryParams = { active: true, currentWindow: true };
        chrome.tabs.query(queryParams, (tabs) => {
            const tabInfos: MiniTab[] = tabs.map(tab => ({
                title: tab.title!,
                url: tab.url!,
                icon: tab.favIconUrl || getIconForUrl(tab.url),
                expiration: Date.now() + 3 * 24 * 60 * 60 * 1000
            }));
            addToTempList(tabInfos, sendResponse);
            // chrome.storage.local.get({ tempList: [] }, (result) => {
            // chrome.storage.local.set({ tempList: [...result.tempList, ...tabInfos] }, () => {
            //     sendResponse({ status: 'success', newTempList: [...result.tempList, ...tabInfos] });
            // });
            // })
        })
    } else if (message.type === 'REQUEST_IF_MULTIPLE_WINDOWS') {
        chrome.windows.getAll({ populate: true }, (windows) => {
            sendResponse({ multipleWindows: windows.length > 1 });
        });
    } else if (message.type === 'OPEN_TAB') {
        chrome.tabs.query({ url: message.url }, (tabs) => {
            if (tabs.length > 0) {
                const tab = tabs[0];
                if (tab.id !== undefined && tab.windowId !== undefined) {
                    chrome.tabs.update(tab.id, { active: true }, () => {
                        chrome.windows.update(tab.windowId, { focused: true });
                    });
                    sendResponse({ found: true });
                } else {
                    sendResponse({ found: false });
                }
            } else {
                sendResponse({ found: false });
            }
        });
    }
    return true;
});

chrome.tabs.onCreated.addListener((tab) => {
    chrome.tabs.query({ windowId: tab.windowId }, async (tabs) => {
        // const { tabLimit, expirationDate } = await chrome.storage.local.get(["tabLimit", "expirationDays"]);
        const { tabLimit } = await chrome.storage.local.get(["tabLimit", "expirationDays"]);
        if (tabs.length > tabLimit) {
            let leastVisitedTab = tabs[0];
            tabs.forEach((t) => {
                if (t.id !== tab.id && t.lastAccessed !== undefined && (leastVisitedTab.lastAccessed === undefined || t.lastAccessed < leastVisitedTab.lastAccessed)) {
                    leastVisitedTab = t;
                }
            });
            if (leastVisitedTab.id !== undefined) {
                chrome.tabs.remove(leastVisitedTab.id);
                if (leastVisitedTab.title === undefined || leastVisitedTab.url === undefined) {
                    return
                }
                const removedTabInfo = {
                    title: leastVisitedTab.title,
                    url: leastVisitedTab.url,
                    icon: leastVisitedTab.favIconUrl || getIconForUrl(leastVisitedTab.url),
                    expiration: Date.now() + 2 * 60 * 1000
                }
                addToTempList([removedTabInfo]);
                // chrome.storage.local.get({ tempList: [] }, (result) => {
                //     console.log(result)
                //     const removedTabs = result.tempList || [];
                //     const existingTabIndex = removedTabs.findIndex((tab: MiniTab) => tab.url === removedTabInfo.url);

                //     if (existingTabIndex !== -1) {
                //         removedTabs[existingTabIndex] = removedTabInfo;
                //     } else {
                //         removedTabs.push(removedTabInfo);
                //     }
                //     chrome.storage.local.set({ tempList: removedTabs });
                // });
            }
        }
    });
});


chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyJob') {
        chrome.storage.local.get({ tempList: [] }, async (result) => {
            const { expiringTabs: expiredTabs } = await chrome.storage.local.get({ expiringTabs: [] });
            let tabs = result.tempList || [];
            tabs = tabs.filter((tab: MiniTab) => !expiredTabs.some((expiredTab: MiniTab) => expiredTab.url === tab.url));
            // addToTempList(tabs);
            // chrome.storage.local.set({ expiringTabs: [] });
            chrome.storage.local.set({ tempList: tabs, expiringTabs: [] });
            const expiringTabs = tabs.filter((tab: MiniTab) => tab.expiration && new Date(tab.expiration).getTime() < (Date.now() + 60 * 1000));
            if (expiringTabs.length > 0) {
                chrome.action.openPopup(() => {
                    if (chrome.runtime.lastError) {
                        console.error('Failed to open popup:', chrome.runtime.lastError);
                    } else {
                        console.log('Popup opened successfully.');
                        chrome.storage.local.set({ expiringTabs })
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
