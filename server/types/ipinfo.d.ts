declare module 'ipinfo' {
  interface IPinfoResponse {
    ip: string;
    hostname?: string;
    city?: string;
    region?: string;
    country?: string;
    loc?: string;
    org?: string;
    postal?: string;
    timezone?: string;
  }

  class IPinfo {
    constructor(token: string);
    lookupIp(ip: string): Promise<IPinfoResponse>;
  }

  export default IPinfo;
} 