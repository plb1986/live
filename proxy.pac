function FindProxyForURL(url, host) {
    var homeProxy = "PROXY 192.168.1.200:7890";
    var officeProxy = "PROXY 192.168.5.200:7890";
    var direct = "DIRECT";
    
    // 更可靠的网络检测方法
    var network = detectNetwork();
    
    if (network === "home") {
        return useProxyWithRules(homeProxy, direct, host);
    } else if (network === "office") {
        return useProxyWithRules(officeProxy, direct, host);
    } else {
        // 未知网络，尝试所有代理
        return tryAllProxies(host);
    }
}

function detectNetwork() {
    // 方法1：尝试检测网关
    try {
        // 通过DNS查询判断
        var testHost = "router.local"; // 可以改为你的路由器地址
        
        // 在家时可能访问到的设备
        if (isResolvable("192.168.1.1")) {
            return "home";
        }
        
        // 在单位时可能访问到的设备
        if (isResolvable("192.168.5.1")) {
            return "office";
        }
    } catch(e) {}
    
    // 方法2：通过可访问性判断
    try {
        // 尝试访问家庭网络特有资源
        if (shExpMatch(dnsResolve(""), "192.168.1.*")) {
            return "home";
        }
    } catch(e) {}
    
    // 方法3：简单的IP检测
    try {
        var myIP = myIpAddress();
        if (isInNet(myIP, "192.168.1.0", "255.255.255.0")) {
            return "home";
        }
        if (isInNet(myIP, "192.168.5.0", "255.255.255.0")) {
            return "office";
        }
    } catch(e) {}
    
    return "unknown";
}

// 辅助函数：检查主机是否可解析
function isResolvable(host) {
    try {
        dnsResolve(host);
        return true;
    } catch(e) {
        return false;
    }
}

function useProxyWithRules(proxy, direct, host) {
    // [这里使用方案一中的 useProxyWithRules 函数内容]
    // 保持与方案一相同
}

function tryAllProxies(host) {
    // 当网络未知时，尝试所有代理服务器
    var homeProxy = "PROXY 192.168.1.200:7890";
    var officeProxy = "PROXY 192.168.5.200:7890";
    var direct = "DIRECT";
    
    // 内网地址直接连接
    if (isPlainHostName(host) || 
        host.includes("local") ||
        isInNet(dnsResolve(host), "192.168.0.0", "255.255.0.0")) {
        return direct;
    }
    
    // 尝试家庭代理，然后是单位代理
    return homeProxy + "; " + officeProxy + "; " + direct;
}
