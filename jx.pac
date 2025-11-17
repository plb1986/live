function FindProxyForURL(url, host) {
    // 1. 本地地址直接连接
    if (isPlainHostName(host) || 
        shExpMatch(host, "localhost") ||
        shExpMatch(host, "*.local")) {
        return "DIRECT";
    }
    
    // 2. 私有IP段直接连接
    if (isInNet(host, "10.0.0.0", "255.0.0.0") ||
        isInNet(host, "172.16.0.0", "255.240.0.0") ||
        isInNet(host, "192.168.0.0", "255.255.0.0") ||
        isInNet(host, "127.0.0.0", "255.0.0.0")) {
        return "DIRECT";
    }
    
    // 3. 公司内部域名直接连接（根据实际情况修改）
    if (dnsDomainIs(host, ".company.com") ||
        dnsDomainIs(host, ".internal") ||
        dnsDomainIs(host, ".lan")) {
        return "DIRECT";
    }
    
    // 4. 其他所有流量使用代理
    return "PROXY 192.168.5.200:7890";
}
