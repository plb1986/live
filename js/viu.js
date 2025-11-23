function main(item) {
    if (jz.mode == 3) {
        const res = fetch('https://api.viu.tv/production/channels');
        const groups = [];
        const channels = [];
        for (const channel of res.body.channels) {
            channels.push({
                name: channel.channelName,
                logo: channel.channelLogoLink,
                links: [
                    {
                        link: [
                            {
                                url: 'http://?id=' + channel.channelNoForVod,
                                js: jz.path,
                            }
                        ]
                    }
                ]
            });
        }

        let name = 'viu.tv';
        if (item.name) {
            name = item.name;
        }
        groups.push({ name: name, channels: channels });
        return { groups: groups };
    }

    const generateRandom = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 18; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };


    const id = jz.getQuery(item.url, 'id');
    const cookie = generateRandom();
    const res = fetch('https://api.viu.now.com/p8/3/getLiveURL', {
        method: 'POST',
        body: {
            "callerReferenceNo": new Date().getTime().toString(),
            "channelno": id,
            "contentId": id,
            "contentType": "Channel",
            "mode": "prod",
            "PIN": "password",
            "cookie": cookie,
            "deviceId": cookie,
            "deviceType": "ANDRIOD_WEB",
            "format": "HLS"
        }
    });
    return { url: res.body.asset[0]};
}