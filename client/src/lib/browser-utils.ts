interface BrowserInfo {
  name: string;
  icon: string;
}

export const getBrowserInfo = (userAgent: string): BrowserInfo => {
  if (userAgent.includes('YaBrowser')) {
    return {
      name: 'Yandex',
      icon: 'yandex'
    };
  }
  if (userAgent.includes('Edg')) {
    return {
      name: 'Edge',
      icon: 'edge'
    };
  }
  if (userAgent.includes('Chrome')) {
    return {
      name: 'Chrome',
      icon: 'chrome'
    };
  }
  if (userAgent.includes('Firefox')) {
    return {
      name: 'Firefox',
      icon: 'firefox'
    };
  }
  if (userAgent.includes('Safari')) {
    return {
      name: 'Safari',
      icon: 'safari'
    };
  }
  return {
    name: 'Unknown',
    icon: 'globe'
  };
}; 