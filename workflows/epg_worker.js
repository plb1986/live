addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  let originalUrl = 'http://epg.112114.xyz' + url.pathname + url.search;

  // 如果 URL 后参数为空，则设置默认参数为当前日期格式为 yyyy-MM-dd
  if (url.search === '') {
    originalUrl += `?ch=CCTV1&date=${getCurrentDateInShanghaiTimezone()}`;
  }

  const response = await fetch(originalUrl);
  const { status, statusText, headers } = response;
  const body = await response.arrayBuffer();

  // 根据请求 URL 是否包含 ".xml" 设置响应的 Content-Type
  const contentType = url.pathname.includes('.xml') ? 'text/xml' : 'application/json';

  return new Response(body, {
    status,
    statusText,
    headers: {
      ...headers,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*', // 可选：设置 CORS 头以允许跨域请求
    },
  });
}

// 获取当前日期，格式为 yyyy-MM-dd，以上海时区（UTC+8:00）为准
function getCurrentDateInShanghaiTimezone() {
  const dateObj = new Date();
  dateObj.setHours(dateObj.getHours() + 8); // 设置为上海时区
  const year = dateObj.getFullYear();
  const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
  const day = ('0' + dateObj.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}
