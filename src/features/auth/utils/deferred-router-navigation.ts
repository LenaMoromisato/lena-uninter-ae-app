'use client';

type RouterLike = {
  replace: (href: string) => void;
  push: (href: string) => void;
};

function scheduleNavigation(action: () => void) {
  if (typeof window === 'undefined') {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.setTimeout(action, 50);
    });
  });
}

export function deferredRouterReplace(router: RouterLike, href: string) {
  scheduleNavigation(() => {
    router.replace(href);
  });
}

export function deferredRouterPush(router: RouterLike, href: string) {
  scheduleNavigation(() => {
    router.push(href);
  });
}
