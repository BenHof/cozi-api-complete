# Network Traffic Inspection Guide

## Method 1: Browser DevTools (Easiest)

### Steps:
1. Open Chrome/Firefox
2. Go to https://www.cozi.com and login
3. Open DevTools (F12 or Cmd+Option+I)
4. Go to **Network** tab
5. Check "Preserve log"
6. Filter by `XHR` or `Fetch`
7. Interact with Cozi (view calendar, create appointments, set reminders, etc.)
8. Watch for API calls to `rest.cozi.com`

### What to look for:
- Request URLs (endpoints)
- Request methods (GET, POST, PUT, DELETE)
- Request payloads (JSON body)
- Response data structures
- Headers (especially Authorization)

### Export Results:
- Right-click on network requests → Copy → Copy as cURL
- Save all interesting requests

## Method 2: HTTP Proxy (More Comprehensive)

### Using mitmproxy:
```bash
# Install
brew install mitmproxy

# Run proxy
mitmproxy

# Configure browser to use proxy: localhost:8080
# Install mitmproxy certificate (shown on first run)

# Use Cozi web app
# All traffic will be captured

# Export with:
# Press 'w' to save flows
```

## Method 3: Mobile App Traffic (Advanced)

### iOS with Charles Proxy:
1. Install Charles Proxy on Mac
2. Configure iPhone to use Mac as proxy
3. Install Charles SSL certificate on iPhone
4. Use Cozi iOS app
5. Capture all API traffic

### Android with Packet Capture:
1. Install "Packet Capture" app (no root needed)
2. Start capture
3. Use Cozi Android app
4. Export PCAP file

## Method 4: Decompile Mobile Apps (Expert)

### iOS (requires jailbreak or IPA file):
```bash
# Get IPA file
# Use Hopper Disassembler or Ghidra
# Search for API strings
```

### Android (easier):
```bash
# Download APK from APKPure
apktool d cozi.apk

# Search for API endpoints
grep -r "rest.cozi.com" cozi/
grep -r "api/ext/" cozi/

# Look in:
# - res/values/strings.xml
# - smali files
# - assets/
```

## What to Search For

### Common patterns:
- `/api/ext/2004/` or `/api/ext/2207/`
- `/reminder`, `/notification`, `/message`
- `/recipe`, `/meal`, `/contact`
- `/photo`, `/attachment`, `/file`
- `/share`, `/invite`, `/member`

### Hidden features:
- Family journal/messages
- Recipe/meal planning
- Shopping history
- Photo albums
- Shared calendars
- Settings/preferences
- Invitations
