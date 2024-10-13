export interface TabInfo {
    active: boolean;
    audible: boolean;
    autoDiscardable: boolean;
    discarded: boolean;
    favIconUrl: string;
    groupId: number;
    height: number;
    highlighted: boolean;
    id: number;
    incognito: boolean;
    index: number;
    lastAccessed: number;
    mutedInfo: { muted: boolean };
    pinned: boolean;
    selected: boolean;
    status: string;
    title: string;
    url: string;
    width: number;
    windowId: number;
}

export interface MiniTab {
    title: string;
    url: string;
    icon: string;
    expiration: number;
}

export interface PinnedTab {
    title: string;
    url: string;
    icon: string;
}

export interface WindowInfo {
    alwaysOnTop: boolean;
    focused: boolean;
    height: number;
    id: number;
    incognito: boolean;
    left: number;
    state: string;
    tabs: TabInfo[];
    top: number;
    type: string;
    width: number;
}