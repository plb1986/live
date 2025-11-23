function main(item) {
    if (jz.mode == 3) {
        const res = fetch("https://api2.hoy.tv/api/v3/a/channel");
        if (!res.ok) {
            return { error: res.statusText }
        }

        if (res.body.code != 200) {
            return { error: '返回错误状态！' }
        }

        const groups = [];
        const channels = [];
        for (const channel of res.body.data) {
            channels.push({
                name: channel.name.zh_hk,
                logo: channel.image,
                links: [
                    {
                        link: [
                            {
                                url: 'https://api2.hoy.tv/api/v3/a/liveCheckout/' + channel.id,
                                js: jz.path,
                            }
                        ]
                    }
                ]
            });
        }


        let name = 'HOY';

        if (item.name) {
            name = item.name;
        }
        groups.push({ name: name, channels: channels });
        return { groups: groups };
    }

    const headers = {
        'Referer': 'https://hoy.tv/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0'
    }

    const res = fetch(item.url, { method: 'POST', headers: headers });

    if (!res.ok) {
        return { error: res.statusText }
    }

    if (res.body.code != 200) {
        return { error: '返回错误状态！' }
    }
    const data = res.body.data;
    headers.cookie = 'CloudFront-Policy=' + data.signed['CloudFront-Policy'] + ';CloudFront-Signature=' + data.signed['CloudFront-Signature'] + ';CloudFront-Key-Pair-Id=' + data.signed['CloudFront-Key-Pair-Id'];
    return { url: data.signedUrl, headers: headers }
}