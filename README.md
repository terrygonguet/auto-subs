# auto-subs

A tool to download, keep track of and watch Youtube videos. Intended for my personal use.

## Usage

```
git clone https://github.com/terrygonguet/auto-subs/
cd auto-subs
npm install
npm run build
npm start
```

When you start it, the server will listen on the port in the `PORT` environment variable, 8080 by default. The first time you load the page it will ask you for a cookie, it's the `COOKIE` header from your request to youtube.com`, I won't tell you how to get that, Google is your friend.

If the subscriptions page breaks at any time, refreshing the cookie usually does it (lower left corner).
