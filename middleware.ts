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
  const ipAddress = env.LOCAL === "true" ? "127.0.0.1" : request.headers.get("remoteAddr"); // nginx remoteAddr ip adress
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
    if (!ua || isBot) {
      logstatus("Blocked", ipAddress, ua || "N/A", request.method, requestPath);
      return NextResponse.redirect("https://www.google.com/");
    } else {
      logstatus("Allowed", ipAddress, ua || "N/A", request.method, requestPath);
    }
    return response;
  }

  if (ua) {
    logstatus("Allowed", ipAddress, ua || "N/A", request.method, requestPath);
    return response;
  }

  if (!ua || !ipAddress || isBot || isbotPackage || isShortUserAgent) {
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
