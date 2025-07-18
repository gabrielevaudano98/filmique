export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeout: NodeJS.Timeout;
  return function(this: any, ...args: any[]) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  } as T;
}
