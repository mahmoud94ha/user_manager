import { NextResponse, userAgent } from "next/server";
import type { NextRequest } from "next/server";
import isbot from "isbot";
import { env } from "process";

export const corsHeaders = {
  origin: process.env.URL,
  "Access-Control-Allow-Origin": process.env.URL,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const blockedUserAgents = [
  "bot",
  "inspect",
  "inspection",
  "mediapartner",
  "verifi",
  "feedfetcher",
  "crawl",
  "producer",
  "favicon",
  "googleother",
  "extended",
  "api",
  "duplex",
  "aloud",
  "censys",
  "curl",
  "zgrab",
  "urllib",
  "libwww",
  "siteexplorer",
  "it2media",
  "coccoc",
  "barkrowler",
  "spider",
  "masscan",
  "windows-update-agent",
  "x11",
  "scaninfo",
  "android 4",
  "iphone os 13",
  "measurement",
  "python-requests",
  "dalvik",
  "intel mac os x 10_11",
  "winnt4.0",
  "windows nt 6",
  "mise 6",
  "mra58k",
  "facebookexternalhit",
  "simplepie",
  "yahooseeker",
  "embedly",
  "quora link preview",
  "outbrain",
  "vkshare",
  "monit",
  "pingability",
  "monitoring",
  "winhttprequest",
  "apache-httpclient",
  "getprismatic.com",
  "twurly",
  "yandex",
  "browserproxy",
  "crawler",
  "qwantify",
  "yahoo! slurp",
  "pinterest",
  "tumblr/14.0.835.186",
  "tumblr agent 14.0",
  "whatsapp",
  "google-structured-data-testing-tool",
  "google-inspectiontool",
  "gptbot",
  "applebot",
  "python-",
  "scans",
  "symbian",
  "fasthttp",
  "facebook"
];

const allowedUserAgents = [
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
];

function logstatus(status: string, ipAddress: string, useragent: string, method: string, path: string) {
  let coloredStatus: any;
  if (status === "Blocked") {
    coloredStatus = `\x1b[31m${status}\x1b[0m`;
  } else if (status === "Allowed") {
    coloredStatus = `\x1b[32m${status}\x1b[0m`;
  } else {
    coloredStatus = status;
  }
  const coloredMethod = `\x1b[33m${method}\x1b[0m`;
  const logMessage = `${coloredStatus}: ${ipAddress}, ${useragent}, ${coloredMethod} -> ${path}`;
  console.log(logMessage);
}

export async function middleware(request: NextRequest) {
  const ipAddress = env.LOCAL === "true" ? "127.0.0.1" : request.headers.get("remoteAddr");
  const requestPath = request.nextUrl.pathname;

  const banned_ips_req = await fetch(`${env.NEXTAUTH_URL}/api/secure/bannedlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key: env.MIDDLEWARE_SECRET })
  });
  const banned_ips_req_json = await banned_ips_req.json();
  const bannedIps: string[] = banned_ips_req_json.bannedIps;

  if (!requestPath.startsWith('/api') && !requestPath.startsWith('/_next') && !requestPath.startsWith('/banned') && !requestPath.startsWith('/favicon.ico') && !requestPath.startsWith('/support')) {
    if (bannedIps.includes(ipAddress)) {
      logstatus("Blocked", ipAddress, "N/A", request.method, request.nextUrl.pathname);
      return NextResponse.redirect(`${env.NEXTAUTH_URL}/banned`);
    }
  }

  const { isBot, ua } = userAgent(request);
  const isbotPackage = isbot(ua);
  const isShortUserAgent = ua && ua.length < 20;
  const myIsBot = blockedUserAgents.some((agent) =>
    ua?.toLowerCase().includes(agent)
  );

  const response = NextResponse.next();

  response.headers.append(
    "Access-Control-Allow-Origin",
    corsHeaders["Access-Control-Allow-Origin"]
  );
  response.headers.append(
    "Access-Control-Allow-Methods",
    corsHeaders["Access-Control-Allow-Methods"]
  );
  response.headers.append(
    "Access-Control-Allow-Headers",
    corsHeaders["Access-Control-Allow-Headers"]
  );
  response.headers.append("origin", corsHeaders["origin"]);

  if (requestPath.startsWith("/api")) {
    if (!ua || myIsBot || isBot) {
      logstatus("Blocked", ipAddress, ua || "N/A", request.method, requestPath);
      return NextResponse.redirect("https://www.google.com/");
    } else {
      logstatus("Allowed", ipAddress, ua || "N/A", request.method, requestPath);
    }
    return response;
  }

  if (ua && allowedUserAgents.includes(ua)) {
    logstatus("Allowed", ipAddress, ua || "N/A", request.method, requestPath);
    return response;
  }

  if (!ua || !ipAddress || myIsBot || isBot || isbotPackage || isShortUserAgent) {
    logstatus("Blocked", ipAddress, ua || "N/A", request.method, requestPath);
    return NextResponse.redirect("https://www.google.com/");
  } else {
    logstatus("Allowed", ipAddress, ua || "N/A", request.method, requestPath);
  }

  if (request.method === "OPTIONS") {
    console.log("OPTIONS request received.");
    return NextResponse.json({}, { headers: corsHeaders });
  }

  return response;
}
