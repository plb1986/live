function FindProxyForURL(url, host) {
    // 手机端简化配置
    var homeProxy = "PROXY 192.168.1.200:7890";
    var officeProxy = "PROXY 192.168.5.200:7890";
    var direct = "DIRECT";
    
    // 自动检测当前网络
    var currentProxy = detectCurrentProxy();
    
    console.log("手机代理 - 主机:", host, "网络:", currentProxy);
    
    // 1. 内网地址直接连接
    if (isPlainHostName(host) ||
        host === "localhost" ||
        host.includes("192.168.") ||
        host.includes("10.") ||
        host.includes(".local")) {
        return direct;
    }
    
    // 2. 常用需要代理的App域名
    var proxyDomains = [
        // Google系列
        "google.com", "gstatic.com", "googleapis.com", "googleusercontent.com",
        "youtube.com", "ytimg.com", "googlevideo.com",
        "gmail.com", "googlemail.com",
        
        // 社交媒体
        "twitter.com", "twimg.com", "t.co",
        "facebook.com", "fb.com", "fbcdn.net",
        "instagram.com", "cdninstagram.com",
        
        // 开发相关
        "github.com", "githubusercontent.com", "github.io",
        "gitlab.com", "stackoverflow.com", "stackexchange.com",
        
        // AI相关
        "openai.com", "chatgpt.com", "oaistatic.com",
        "anthropic.com", "claude.ai",
        
        // 其他国际服务
        "reddit.com", "medium.com", "quora.com",
        "discord.com", "discordapp.com", "discord.gg",
        "notion.so", "figma.com", "slack.com",
        "dropbox.com", "drive.google.com",
        "wikipedia.org", "wikimedia.org"
    ];
    
    // 检查是否需要代理
    for (var i = 0; i < proxyDomains.length; i++) {
        if (host.endsWith(proxyDomains[i]) ||
            host.includes("." + proxyDomains[i]) ||
            host === proxyDomains[i]) {
            return currentProxy + "; " + direct;
        }
    }
    
    // 3. 国内App和网站直连
    var chinaDomains = [
        // 百度系
        "baidu.com", "baidubcr.com", "bdstatic.com", "baidupcs.com",
        
        // 腾讯系
        "qq.com", "tencent.com", "weixin.com", "wechat.com",
        "qpic.cn", "qlogo.cn", "tencent-cloud.com",
        
        // 阿里系
        "taobao.com", "alibaba.com", "alicdn.com", "alipay.com",
        "tmall.com", "tmall.hk", "1688.com",
        
        // 字节系
        "douyin.com", "tiktok.com", "bytedance.com", "byteimg.com",
        "toutiao.com", "ixigua.com", "snssdk.com",
        
        // 其他常用
        "jd.com", "jingdong.com", "360.com", "so.com",
        "163.com", "126.com", "netease.com",
        "sina.com.cn", "weibo.com", "sinaimg.com",
        "zhihu.com", "zhimg.com", "bilibili.com", "hdslb.com",
        "xiaomi.com", "mi.com", "huawei.com",
        "meituan.com", "dianping.com", "ele.me",
        
        // 视频音乐
        "iqiyi.com", "qiyi.com", "youku.com", "tudou.com",
        "mgtv.com", "kuwo.cn", "kugou.com", "qqmusic.com"
    ];
    
    for (var j = 0; j < chinaDomains.length; j++) {
        if (host.endsWith(chinaDomains[j]) ||
            host.includes("." + chinaDomains[j]) ||
            host === chinaDomains[j]) {
            return direct;
        }
    }
    
    // 4. .cn域名直连
    if (host.endsWith(".cn") ||
        host.endsWith(".com.cn") ||
        host.endsWith(".net.cn") ||
        host.endsWith(".org.cn") ||
        host.endsWith(".gov.cn") ||
        host.endsWith(".edu.cn")) {
        return direct;
    }
    
    // 5. 其他规则
    // 小额支付、银行等直连
    if (host.includes("alipay") ||
        host.includes("wechatpay") ||
        host.includes("unionpay") ||
        host.includes("bank") ||
        host.includes("pay") ||
        host.includes("wallet")) {
        return direct;
    }
    
    // 6. 默认规则：其他网站走代理
    return currentProxy + "; " + direct;
}

function detectCurrentProxy() {
    try {
        var myIP = myIpAddress();
        console.log("手机IP:", myIP);
        
        // 根据IP判断网络
        if (myIP && myIP.startsWith("192.168.1.")) {
            return "PROXY 192.168.1.200:7890";
        }
        if (myIP && myIP.startsWith("192.168.5.")) {
            return "PROXY 192.168.5.200:7890";
        }
        
        // 尝试检测WiFi名称（部分浏览器支持）
        try {
            if (typeof wifiName !== 'undefined') {
                var wifi = wifiName();
                if (wifi && (wifi.includes("Home") || wifi.includes("家的WiFi"))) {
                    return "PROXY 192.168.1.200:7890";
                }
                if (wifi && wifi.includes("Office") || wifi.includes("公司")) {
                    return "PROXY 192.168.5.200:7890";
                }
            }
        } catch(e) {}
        
    } catch(e) {
        console.log("网络检测失败:", e);
    }
    
    // 默认使用家庭代理
    return "PROXY 192.168.1.200:7890";
}
