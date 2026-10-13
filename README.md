# n8n-nodes-transcriptyt

An [n8n](https://n8n.io) community node for [TranscriptYT](https://transcript-yt.com), a YouTube Transcript API. Get transcripts of YouTube videos, playlists and channels in 150+ languages (with translation and AI transcription for videos without captions), search YouTube, and summarize videos, all from your workflows. It also works as a tool for n8n AI Agents.

Unlike scraping YouTube from your n8n server, requests go through TranscriptYT's rotating proxies, so they keep working on cloud hosts where YouTube blocks datacenter IPs.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Example](#example) · [Resources](#resources)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/): in n8n, go to **Settings > Community Nodes > Install** and enter `n8n-nodes-transcriptyt`.

## Operations

**Transcript**
- **Get**: one video's transcript as JSON (text, timed segments, metadata), text, Markdown, SRT, VTT or CSV. 1 credit.
- **Get Many**: up to 50 transcripts in one call, from a list of videos or a playlist or channel. 1 credit per video.

Options: language, translate to, timestamps, paragraphs, include segments, caption type, mode (captions, AI fallback, or AI only), start/end time, search within the transcript.

**Video** (free)
- **Search**: search YouTube, optionally within one channel
- **List Playlist or Channel**: list the videos in a playlist or a channel's uploads
- **List Languages**: list a video's caption tracks

**Summary**
- **Get**: AI summary, key points and timestamped notes for a video

**Account**
- **Get Usage**: plan, credits used and remaining

## Credentials

1. Sign up at [transcript-yt.com](https://transcript-yt.com) (100 free credits, no card).
2. Create an API key at [transcript-yt.com/dashboard/keys](https://transcript-yt.com/dashboard/keys).
3. In n8n, create a **TranscriptYT API** credential and paste the `ts_live_...` key.

## Example

Summarize every new video from a channel: **Schedule Trigger** → **TranscriptYT** (Video > List Playlist or Channel, limit 5) → **TranscriptYT** (Transcript > Get, Format: Text, Video URL `{{$json.videoId}}`) → **OpenAI / Anthropic** (summarize) → **Slack** or **Notion**.

## Compatibility

Tested with n8n 1.x and later. No runtime dependencies.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [TranscriptYT API docs](https://transcript-yt.com/docs)
- [YouTube transcripts in n8n guide](https://transcript-yt.com/blog/youtube-transcripts-n8n)

## License

[MIT](LICENSE.md)
