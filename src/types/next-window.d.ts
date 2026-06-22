export {};

declare global {
  interface Window {
    next?: {
      router?: {
        push: (href: string) => void;
        replace: (href: string) => void;
      };
    };
    __NEXT_HYDRATED?: boolean;
  }
}
