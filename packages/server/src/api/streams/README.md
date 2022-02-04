# Streaming video with RTV

Stream can be launched on local or remote machine with `ffmpeg`:
```
until ffmpeg -i [VIDEO_DEVICE] \
-f mpegts \
-codec:v mpeg1video \
-codec:a mp2 \
-s 1280x720 \
-r 32 \
-q 1 \
http://[RTV_SERVER_URL]/api/streams/[STREAM_ID]?rtv-user=camera; \
do \
echo "Error. Retry in 10 sec..."; \
sleep 10; \
done;
```
For example:
```
until ffmpeg -i /dev/video1 \
-f mpegts \
-codec:v mpeg1video \
-codec:a mp2 \
-s 1280x720 \
-r 32 \
-q 1 \
http://localhost:3000/api/streams/1?rtv-user=camera; \
do \
echo "Error. Retry in 10 sec..."; \
sleep 10; \
done;
```

This script will push MPEG-TS stream to rtv-server. Stream will be retranslated by websocket-server to multiple clients.
Clients can connect to websocket `ws://[RTV_SERVER_URL]/api/streams/[STREAM_ID]` and read stream for example with [JSMpeg](https://github.com/phoboslab/jsmpeg)
