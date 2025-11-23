function main(item) {
    const id = jz.getQuery(item.url, "id");
    let url = "http://50.7.158.194:8278/" + id + "/playlist.m3u8";
    const tid = "m6c3d0668cf5b";
    const t = String(Math.floor(Date.now() / 150));
    const tsum = jz.digest("md5", "tvata nginx auth module" + "/" + id + "/playlist.m3u8" + tid + t);
    url += "?tid=" + tid + "&" + "ct=" + t + "&tsum=" + tsum;
    return {
        url: url,
        headers: {
            'CLIENT-IP': '127.0.0.1',
            'X-FORWARDED-FOR': '127.0.0.1'
        }
    };
}