// The user's mordel.net API key. It is kept on this device only, under its own storage key so that backups and
// settings exports (which list their fields one by one) never carry it, and it is only ever sent to mordel.net.
import { readLocalStorage, writeLocalStorage } from "../../dataSavesStorage";

export const MORDEL_KEY_STORAGE = "mordelApiKey";
const SERVER_STORAGE = "mordelServer";
const REJECTED_STORAGE = "mordelKeyRejected";

export type MordelServer = "production" | "sandbox";

// VERIFY with Scott: the production API's address. The sandbox's is from his docs.
export const MORDEL_BASES: Record<MordelServer, string> = {
    production: "https://mordel.net/api/v1",
    sandbox: "https://sandbox.mordel.net/api/v1",
};
/** The Vite dev server's proxies (vite.config.ts), for testing before mordel.net allows this site (CORS). */
export const MORDEL_DEV_PROXIES: Record<MordelServer, string> = {
    production: "/mordel-api",
    sandbox: "/mordel-sandbox-api",
};

const removeLocalStorage = (keyName: string): void => {
    try {
        localStorage.removeItem(keyName);
    } catch {
        // Storage may be disabled; there is then nothing to remove.
    }
};

export function getMordelKey(): string | null {
    const key = readLocalStorage(MORDEL_KEY_STORAGE)?.trim();
    return key ? key : null;
}

export function saveMordelKey(key: string): void {
    writeLocalStorage(MORDEL_KEY_STORAGE, key.trim());
    removeLocalStorage(REJECTED_STORAGE);
}

export function removeMordelKey(): void {
    removeLocalStorage(MORDEL_KEY_STORAGE);
    removeLocalStorage(REJECTED_STORAGE);
}

/** mordel.net answered 401 for the saved key: it was revoked or mistyped. Cleared when a key is saved. */
export function isMordelKeyRejected(): boolean {
    return readLocalStorage(REJECTED_STORAGE) === "1";
}

export function markMordelKeyRejected(): void {
    writeLocalStorage(REJECTED_STORAGE, "1");
}

/** The saved key shown safely: dots and its last four characters. */
export function maskMordelKey(key: string): string {
    return key.length <= 4 ? "••••" : "••••" + key.slice(-4);
}

export function getMordelServer(): MordelServer {
    return readLocalStorage(SERVER_STORAGE) === "sandbox" ? "sandbox" : "production";
}

export function setMordelServer(server: MordelServer): void {
    writeLocalStorage(SERVER_STORAGE, server);
}

/** The API base for the chosen server: the dev proxy under "vite dev", the site itself otherwise. */
export function mordelBaseUrl(dev: boolean = import.meta.env.DEV, server: MordelServer = getMordelServer()): string {
    return dev ? MORDEL_DEV_PROXIES[server] : MORDEL_BASES[server];
}
