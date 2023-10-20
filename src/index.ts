import {GatewayIntentBits, Client, Events} from "discord.js";
import dotenv from "dotenv";
import ytdl from "ytdl-core"
import {createAudioPlayer, createAudioResource, joinVoiceChannel} from "@discordjs/voice";
import ffmpeg from "ffmpeg-static";

dotenv.config();

const BOT_TOKEN = process.env["BOT_TOKEN"]!;
const GUILD_ID = process.env["GUILD_ID"]!;
const CHANNEL_ID = process.env["VOICE_CHANNEL_ID"]!;
const YOUTUBE_URL = process.env["YOUTUBE_URL"]!;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);

    job();
})

const job = () => {
    const connection = joinVoiceChannel({
        channelId: CHANNEL_ID,
        guildId: GUILD_ID,
        adapterCreator: client.guilds.cache.get(GUILD_ID)?.voiceAdapterCreator!,
    });

    try {
        const player = createAudioPlayer();
        connection.subscribe(player);

        const stream = ytdl(YOUTUBE_URL, {filter: "audioonly"});
        stream.on("error", (err) => console.error(err));

        const resource = createAudioResource(stream, {inlineVolume: true});
        resource.volume?.setVolume(0.2);

        player.play(resource);
    } catch (error) {
        console.log(error);
    } finally {
        setTimeout(() => connection.destroy(), 15_000);
    }
};

client.login(BOT_TOKEN);