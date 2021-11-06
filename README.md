# Media Web UI

I have a bunch of music and videos stored on a file server in my house. I'm
happy enough accessing it over SMB but others in my family find web interfaces
easier to live with, so this is an attempt to do that without really putting in
any real effort.

## Assumptions

This is tuned to the way I have stored media on my file server, or rather the
ways I have stored media on my file server. File and directory names mostly
begin with a 1- 2- 3- or 4-digit number followed by ` - ` then the name of the
thing. 1- and 2- digit numbers are assumed to be track numbers. 3-digit
numbers are assumed to be a disc number followed by a track number. 4-digit
numbers are assumed to be year numbers. Any name which doesn't begin with a
code number is assumed to be just the name on its own.

This project assumes that all the media files are locally accessible in the
filesystem on the machine where you're running this.

## Getting Started

Edit `lib/constants.ts` to set `MediaDir` to the local filesystem path where
your media files live.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and check that you can see
the stuff you expected to see. You won't be able to play anything yet, but this
`dev` mode has automatic reloading when you change something so it's helpful
if you need to tweak anything.

Once you are happy with that it's time to configure the real HTTP server to
serve the media files and this application. I used [nginx](https://nginx.org/),
which is why that's used in these instructions, but it should be equally
possible to get this going with any other full-featured HTTP server.

Leave the `npm run dev` going while you do this.

### Install nginx

On my machine this was:
```bash
sudo apt install nginx
```

### Configure nginx

Setup nginx serve your media files and to show the UI as well. Here is what I
changed or added in `/etc/nginx/sites-enabled/default` on my system to achieve
this:

```
root /Media;

location / {
    proxy_pass http://127.0.0.1:3000/;
}

location ~ \.(mp3|flac|m4a|mkv|mp4|m4v|webm)$ {
    try_files $uri =404;
}
```

This says, approximately:
* The files to serve are in `/Media`
* Pass every request on to the server on port 3000...
* ...unless the URL ends in .mp3, .flac, .m4a, .mkv, .mp4 or .m4v - those
  are either real files or 404 not found

### Check nginx config

On my machine I run
```bash
sudo service nginx reload
```
and it will print out errors if I spelled something wrong in the config or
forgot a `;`.

Then I access [http://localhost](http://localhost) and check that I see the UI
from [http://localhost:3000](http://localhost:3000). It should load, and this
time it should be possible to play the media, assuming that your browser can
play what you select.

## Getting Finished

Ctrl-C the `npm run dev` from earlier.

Do `npm run build` to build the project. If there are any errors, you will need
to fix them.

Finally, run `npm run start` to run the real version of the code. Again check
it's working at [http://localhost](http://localhost)

## Support

It's working as I want it for me, so don't expect anything much. Please use
normal GitHub issues/PRs, and do not try to contact me off-GitHub about this.

## Development

This is [built using Next.js](https://nextjs.org/docs).
