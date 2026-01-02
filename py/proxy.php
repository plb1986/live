<?php
// proxy.php - SMT直播源PHP代理
header('Access-Control-Allow-Origin: *'); // 允许跨域调用
header('Content-Type: application/vnd.apple.mpegurl');

$pid = $_GET['pid'] ?? 'cctv1';
$type = $_GET['type'] ?? 'm3u8';

// ========== 关键：生成与原Python脚本完全一致的认证参数 ==========
$tid = 'mc42afe745533';
$ct = floor(time() / 150); // 注意：这里与Python的 int(time.time()/150) 逻辑一致

// 认证字符串格式：请特别注意这里是否需要 "mc42afe745533" 在 `$pid/playlist.m3u8` 之后
// 根据原始Python代码，格式为: "tvata nginx auth module/{$pid}/playlist.m3u8{$tid}{$ct}"
$auth_string = "tvata nginx auth module/{$pid}/playlist.m3u8{$tid}{$ct}";
$tsum = md5($auth_string);

// 构建最终的请求URL
$target_url = "http://smt.tvhd.dpdns.org:8278/{$pid}/playlist.m3u8?tid={$tid}&ct={$ct}&tsum={$tsum}";

// 可选：记录日志，用于调试
// file_put_contents('log.txt', date('Y-m-d H:i:s') . " - PID: {$pid}, URL: {$target_url}\n", FILE_APPEND);

// 发起请求
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $target_url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTPHEADER => [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer: http://smt.tvhd.dpdns.org:8278/',
        'Accept: */*'
    ]
]);
$m3u8_content = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code == 200 && !empty($m3u8_content)) {
    // 成功获取到原始的M3U8列表
    echo $m3u8_content;
} else {
    // 获取失败，返回一个简单的错误信息（符合M3U8格式）
    echo "#EXTM3U\n";
    echo "#EXTINF:-1, 频道暂时无法连接\n";
    echo "#EXTVLCOPT:network-caching=1000\n";
    echo "https://raw.githubusercontent.com/doube-ba/TVlogo/main/error.mp4";
}
?>
