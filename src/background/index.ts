import { MiniTab } from "../utils/types.s";

export const julienMode = {
    tabLimit: 3,
    expirationDays: 2 * 60 * 1000,
    reminderAlarm: 1
}
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
    chrome.storage.local.get({ tempList: [] }, (result) => {
        const existingTabs: MiniTab[] = result.tempList;
        const tabMap = new Map(existingTabs.map(tab => [tab.url, tab]));
        tabs.forEach(newTab => {
            if (newTab.url === 'chrome://newtab/') {
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
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ expiringTabs: [], tempList: [], ...defaultMode, mode: 'default' })
    chrome.alarms.create('default', {
        when: Date.now(),
        periodInMinutes: defaultMode.reminderAlarm
    });
    chrome.alarms.create('julien', {
        when: Date.now(),
        periodInMinutes: julienMode.reminderAlarm
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
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.type === 'REQUEST_TABS_INFO') {
        chrome.storage.local.get({ tempList: [] }, (result) => {
            sendResponse({ type: 'TABS_INFO', tabs: result.tempList || [] });
        });
    } else if (message.type === 'REQUEST_EXPIRING_TABS_INFO') {
        chrome.storage.local.get({ expiringTabs: [] }, (result) => {
            sendResponse({ type: 'TABS_INFO', expiringTabs: result.expiringTabs || [] });
        });
    } else if (message.type === 'REQUEST_SAVE_TABS') {
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
    } else if (message.type === 'TOGGLE_JULIEN_MODE') {
        const data = message.julienMode ? { ...defaultMode, mode: 'default' } : { ...julienMode, mode: 'julien' }
        if (message.julienMode) chrome.storage.local.set({ ...data })
        else chrome.storage.local.set({ ...data })
        sendResponse({ ...data })
    }
    return true;
});

chrome.tabs.onCreated.addListener((tab) => {
    chrome.tabs.query({ windowId: tab.windowId }, async (tabs) => {
        const { tabLimit, expirationDays } = await chrome.storage.local.get(["tabLimit", "expirationDays"]);
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
                const removedTabInfo: MiniTab = {
                    title: leastVisitedTab.title,
                    url: leastVisitedTab.url,
                    icon: leastVisitedTab.favIconUrl || getIconForUrl(leastVisitedTab.url),
                    expiration: Date.now() + expirationDays,
                }
                addToTempList([removedTabInfo]);
            }
        }
    });
});


chrome.alarms.onAlarm.addListener((alarm) => {
    chrome.storage.local.get({ mode: 'default' }, res => {
        if (alarm.name === (res.mode)) {
            chrome.storage.local.get({ tempList: [], expiringTabs: [], reminderAlarm: defaultMode.reminderAlarm }, (result) => {
                const { tempList, expiringTabs: expiredTabs, reminderAlarm } = result;
                const tabs = tempList.filter((tab: MiniTab) => !expiredTabs.some((expiredTab: MiniTab) => expiredTab.url === tab.url));
                chrome.storage.local.set({ tempList: tabs, expiringTabs: [] });
                const expiringTabs = tabs.filter((tab: MiniTab) => tab.expiration && new Date(tab.expiration).getTime() < (Date.now() + reminderAlarm * 60 * 1000));
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
})
