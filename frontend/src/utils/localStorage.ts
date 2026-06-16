export function getLocalStorage<T>(key: string): T | null | string {
  const item = localStorage.getItem(key);

  if (!item) {
    return null;
  }

  try {
    if (typeof item === "string") {
      return item;
    }
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof value === "string") {
    localStorage.setItem(key, value);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function removeLocalStorage(key: string): void {
  localStorage.removeItem(key);
}
