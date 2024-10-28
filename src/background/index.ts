import { MiniTab, PinnedTab } from "../utils/types.s";

// export const julienMode = {
//     tabLimit: 3,
//     expirationDays: 2 * 60 * 1000,
//     reminderAlarm: 1
// }
export const defaultMode = {
    tabLimit: 7,
    expirationDays: 3 * 24 * 60 * 60 * 1000,
    reminderAlarm: 24 * 60
}
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
    const icon = Object.entries(icons).find(([prefix]) => url.startsWith(prefix));
    return icon ? icon[1] : '/fallback.png';
}
function addToTempList(tabs: MiniTab[], callback?: (response: { status: string, newTempList: MiniTab[] }) => void) {
    try {
        chrome.storage.local.get({ tempList: [] }, (result) => {
            const existingTabs: MiniTab[] = result.tempList;
            const tabMap = new Map(existingTabs.map(tab => [tab.url, tab]));
            tabs.forEach(newTab => {
                if (newTab.url === 'chrome://newtab/' || newTab.url === 'about:blank') {
                    return;
                }
                if (tabMap.has(newTab.url)) {
                    const existingTab = tabMap.get(newTab.url)!;
                    existingTab.expiration = newTab.expiration;
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
    } catch (e) {
        //pass
    }
}
const isValidMiniTab = (tab: MiniTab): tab is MiniTab => (
    typeof tab.title === 'string' &&
    typeof tab.url === 'string' &&
    typeof tab.icon === 'string' &&
    typeof tab.expiration === 'number'
);

chrome.runtime.onInstalled.addListener(() => {
    try {
        // chrome.storage.local.set({ expiringTabs: [], tempList: [], pinnedTabs: [], ...defaultMode, mode: 'default' })
        chrome.storage.local.set({ expiringTabs: [], tempList: [], pinnedTabs: [], ...defaultMode })
        // chrome.alarms.create('default', {
        chrome.alarms.create('dailyAlarm', {
            when: Date.now(),
            periodInMinutes: defaultMode.reminderAlarm
        });
        // chrome.alarms.create('julien', {
        //     when: Date.now(),
        //     periodInMinutes: julienMode.reminderAlarm
        // });
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
        chrome.action.openPopup(() => {
            chrome.runtime.sendMessage({
                type: 'FIRST_INSTALL',
            }, () => {
                if (chrome.runtime.lastError) {
                    //pass
                }
            });
        })
    } catch (e) {
        //pass
    }
});

chrome.contextMenus.onClicked.addListener((info) => {
    try {
        let queryParams = {}
        if (info.menuItemId === 'save-window') queryParams = { currentWindow: true };
        else if (info.menuItemId === 'save-tab') queryParams = { active: true, currentWindow: true };
        chrome.storage.local.get({ expirationDays: defaultMode.expirationDays }, result => {
            chrome.tabs.query(queryParams, (tabs) => {
                const tabInfos: MiniTab[] = tabs.map(tab => ({
                    title: tab.title!,
                    url: tab.url!,
                    icon: tab.favIconUrl || getIconForUrl(tab.url),
                    expiration: Date.now() + result.expirationDays
                }));
                addToTempList(tabInfos);
            })
        })
    } catch (e) {
        //pass
    }
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    try {
        if (message.type === 'REQUEST_SAVE_TABS') {
            let queryParams = {}
            if (message.action === 'saveWindow') queryParams = { currentWindow: true };
            else if (message.action === 'saveTab') queryParams = { active: true, currentWindow: true };
            chrome.storage.local.get({ expirationDays: defaultMode.expirationDays }, result => {
                chrome.tabs.query(queryParams, (tabs) => {
                    const tabInfos: MiniTab[] = tabs.map(tab => ({
                        title: tab.title!,
                        url: tab.url!,
                        icon: tab.favIconUrl || getIconForUrl(tab.url),
                        expiration: Date.now() + result.expirationDays
                    }));
                    addToTempList(tabInfos, sendResponse);
                })
            })
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
        } else if (message.type === 'DISMISS_EXPIRING_TAB') {
            chrome.storage.local.get({ expiringTabs: [], tempList: [] }, result => {
                const updatedExpiringTabs = result.expiringTabs.filter((tab: MiniTab) => tab.url !== message.url);
                const updatedTemplist = result.tempList.filter((tab: MiniTab) => tab.url !== message.url);

                chrome.storage.local.set({ expiringTabs: updatedExpiringTabs, tempList: updatedTemplist }, () => {
                    sendResponse({ expiringTabs: updatedExpiringTabs, tempList: updatedTemplist });
                });
            });
        } else if (message.type === 'DISMISS_ALL_EXPIRING') {
            chrome.storage.local.get({ expiringTabs: [], tempList: [] }, result => {
                const expiringTabUrls = (result.expiringTabs).map((tab: MiniTab) => tab.url);
                const updatedTemplist = (result.tempList).filter((tab: MiniTab) => !expiringTabUrls.includes(tab.url));
                chrome.storage.local.set({ expiringTabs: [], tempList: updatedTemplist }, () => {
                    sendResponse({ tempList: updatedTemplist });
                });
            })
            // } else if (message.type === 'TOGGLE_JULIEN_MODE') {
            //     const data = message.julienMode ? { ...defaultMode, mode: 'default' } : { ...julienMode, mode: 'julien' }
            //     chrome.storage.local.set({ ...data })
            //     sendResponse({ ...data })
        } else if (message.type === 'VALIDATE_IMPORT') {
            // const { tabLimit, expirationDays, tempList, expiringTabs, mode } = message.data;

            // const isValidTabLimit = typeof tabLimit === 'number' && (mode === 'default' && tabLimit >= 5 && tabLimit <= 30) || (mode === 'julien' && tabLimit === 3);
            // const isValidExpirationDays = typeof expirationDays === 'number' && (mode === 'default' && expirationDays >= 1 * 24 * 60 * 60 * 1000 && expirationDays <= 7 * 24 * 60 * 60 * 1000) || (mode === 'julien' && expirationDays === 2 * 60 * 1000);
            // const isValidTempList = Array.isArray(tempList) && tempList.every(isValidMiniTab);
            // const isValidExpiringTabs = Array.isArray(expiringTabs) && expiringTabs.every(isValidMiniTab);
            // const isValidMode = typeof mode === 'string' && (mode === 'julien' || mode === 'default');
            // if (isValidTabLimit && isValidExpirationDays && isValidTempList && isValidExpiringTabs && isValidMode) {
            const { tabLimit, expirationDays, tempList, expiringTabs } = message.data;

            const isValidTabLimit = typeof tabLimit === 'number' && tabLimit >= 5 && tabLimit <= 30;
            const isValidExpirationDays = typeof expirationDays === 'number' && expirationDays >= 1 * 24 * 60 * 60 * 1000 && expirationDays <= 7 * 24 * 60 * 60 * 1000;
            const isValidTempList = Array.isArray(tempList) && tempList.every(isValidMiniTab);
            const isValidExpiringTabs = Array.isArray(expiringTabs) && expiringTabs.every(isValidMiniTab);
            if (isValidTabLimit && isValidExpirationDays && isValidTempList && isValidExpiringTabs) {
                chrome.storage.local.set({
                    tabLimit,
                    expirationDays,
                    tempList,
                    expiringTabs,
                    // mode,
                });
                // sendResponse({ status: 'SUCCESS', tabLimit, expirationDays, mode });
                sendResponse({ status: 'SUCCESS', tabLimit, expirationDays });
            } else {
                sendResponse({ status: 'FAILURE', error: 'Invalid data format' });
            }
        } else if (message.type === 'PIN_TAB') {
            const pinnedTabInfo: PinnedTab = {
                title: message.currentTab.title!,
                url: message.currentTab.url!,
                icon: message.currentTab.icon || getIconForUrl(message.currentTab.url),
            }
            chrome.storage.local.get({ pinnedTabs: [] }, (result) => {
                const pinnedTabs: PinnedTab[] = result.pinnedTabs;
                pinnedTabs.push(pinnedTabInfo);
                chrome.storage.local.set({ pinnedTabs }, () => {
                    sendResponse({ pinnedTabs })
                });
            });
        }
        return true;
    } catch (e) {
        //pass
    }
    sendResponse(null)
    return true;
});

chrome.tabs.onCreated.addListener((tab) => {
    try {
        chrome.tabs.query({ windowId: tab.windowId }, async (tabs) => {
            const { tabLimit, expirationDays, pinnedTabs } = await chrome.storage.local.get(["tabLimit", "expirationDays", "pinnedTabs"]);
            const pinnedUrls = pinnedTabs.map((pinnedTab: PinnedTab) => pinnedTab.url);
            const removedTabs: MiniTab[] = [];
            const newTab = tabs.find(t => (t.id !== tab.id && (t.url === 'chrome://newtab/' || t.url === 'about:blank')));
            if (newTab && newTab.id !== undefined) {
                chrome.tabs.remove(newTab.id);
                tabs = tabs.filter(t => t.id !== newTab.id);
            }
            while (tabs.length > tabLimit) {
                let nonPinnedTabs = tabs.filter(t => !pinnedUrls.includes(t.url));

                let leastVisitedTab = nonPinnedTabs.reduce((leastVisited: chrome.tabs.Tab | null, currentTab: chrome.tabs.Tab) => {
                    if (currentTab.id !== tab.id && (currentTab.url === 'chrome://newtab/' || currentTab.url === 'about:blank')) {
                        return currentTab;
                    }
                    if (!leastVisited ||
                        (currentTab.lastAccessed !== undefined &&
                            (leastVisited.lastAccessed === undefined || currentTab.lastAccessed < leastVisited.lastAccessed))) {
                        return currentTab;
                    }
                    return leastVisited;
                }, null);

                if (leastVisitedTab && leastVisitedTab.id !== undefined) {
                    chrome.tabs.remove(leastVisitedTab.id);
                    if (leastVisitedTab.title !== undefined && leastVisitedTab.url !== undefined) {
                        const removedTabInfo: MiniTab = {
                            title: leastVisitedTab.title,
                            url: leastVisitedTab.url,
                            icon: leastVisitedTab.favIconUrl || getIconForUrl(leastVisitedTab.url),
                            expiration: Date.now() + expirationDays
                        };
                        removedTabs.push(removedTabInfo);
                    }
                    tabs = tabs.filter(t => t.id !== leastVisitedTab.id);
                } else {
                    break;
                }
            }
            addToTempList(removedTabs);
        });
    } catch (e) {
        //pass
    }
});


chrome.alarms.onAlarm.addListener((alarm) => {
    try {
        // chrome.storage.local.get({ mode: 'default' }, res => {
        //     if (alarm.name === (res.mode)) {
        if (alarm.name === 'dailyAlarm') {
            chrome.storage.local.get({ tempList: [], expiringTabs: [], reminderAlarm: defaultMode.reminderAlarm }, (result) => {
                const { tempList, expiringTabs: expiredTabs, reminderAlarm } = result;
                const tabs = tempList.filter((tab: MiniTab) => !expiredTabs.some((expiredTab: MiniTab) => expiredTab.url === tab.url));
                chrome.storage.local.set({ tempList: tabs, expiringTabs: [] });
                const expiringTabs = tabs.filter((tab: MiniTab) => tab.expiration && new Date(tab.expiration).getTime() < (Date.now() + reminderAlarm * 60 * 1000));
                if (expiringTabs.length > 0) {
                    chrome.action.openPopup(() => {
                        chrome.storage.local.set({ expiringTabs })
                        chrome.runtime.sendMessage({
                            type: 'EXPIRING_TABS',
                            tabs: expiringTabs
                        });
                    });
                }
            })
        }
        // })
    } catch (e) {
        //pass
    }
})
