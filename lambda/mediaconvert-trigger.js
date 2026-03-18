// Lambda function: triggered by S3 upload, submits MediaConvert job
// Deploy this as a Node.js 20.x Lambda with the SoundSpireLambdaRole

const {
  MediaConvertClient,
  CreateJobCommand,
} = require("@aws-sdk/client-mediaconvert");

const MEDIACONVERT_ENDPOINT = process.env.MEDIACONVERT_ENDPOINT;
const MEDIACONVERT_ROLE = process.env.MEDIACONVERT_ROLE_ARN;
const BUCKET = "soundspirewebsiteassets";
const OUTPUT_PREFIX = "transcoded/";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v", ".m4p", ".wmv"];

exports.handler = async (event) => {
  for (const record of event.Records) {
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    // Only process video files
    const ext = key.substring(key.lastIndexOf(".")).toLowerCase();
    if (!VIDEO_EXTENSIONS.includes(ext)) continue;

    const inputUri = `s3://${BUCKET}/${key}`;
    // Output goes to transcoded/<original-key-without-ext>/
    const outputKey = OUTPUT_PREFIX + key.substring(0, key.lastIndexOf(".")) + "/";

    const client = new MediaConvertClient({
      endpoint: MEDIACONVERT_ENDPOINT,
      region: "ap-south-1",
    });

    const job = {
      Role: MEDIACONVERT_ROLE,
      Settings: {
        Inputs: [{
          FileInput: inputUri,
          VideoSelector: { Rotate: "AUTO" },
          AudioSelectors: { "Audio Selector 1": { DefaultSelection: "DEFAULT" } },
        }],
        OutputGroups: [{
          Name: "HLS Group",
          OutputGroupSettings: {
            Type: "HLS_GROUP_SETTINGS",
            HlsGroupSettings: {
              Destination: `s3://${BUCKET}/${outputKey}`,
              SegmentLength: 6,
              MinSegmentLength: 0,
            },
          },
          Outputs: [
            // 1080p
            {
              NameModifier: "_1080p",
              VideoDescription: {
                Width: 1920, Height: 1080,
                CodecSettings: { Codec: "H_264", H264Settings: { Bitrate: 5000000, RateControlMode: "CBR", CodecProfile: "HIGH" } },
              },
              AudioDescriptions: [{ CodecSettings: { Codec: "AAC", AacSettings: { Bitrate: 128000, SampleRate: 48000, Channels: 2, CodingMode: "CODING_MODE_2_0" } } }],
              ContainerSettings: { Container: "M3U8" },
            },
            // 720p
            {
              NameModifier: "_720p",
              VideoDescription: {
                Width: 1280, Height: 720,
                CodecSettings: { Codec: "H_264", H264Settings: { Bitrate: 2500000, RateControlMode: "CBR", CodecProfile: "HIGH" } },
              },
              AudioDescriptions: [{ CodecSettings: { Codec: "AAC", AacSettings: { Bitrate: 128000, SampleRate: 48000, Channels: 2, CodingMode: "CODING_MODE_2_0" } } }],
              ContainerSettings: { Container: "M3U8" },
            },
            // 480p
            {
              NameModifier: "_480p",
              VideoDescription: {
                Width: 854, Height: 480,
                CodecSettings: { Codec: "H_264", H264Settings: { Bitrate: 1000000, RateControlMode: "CBR", CodecProfile: "MAIN" } },
              },
              AudioDescriptions: [{ CodecSettings: { Codec: "AAC", AacSettings: { Bitrate: 96000, SampleRate: 48000, Channels: 2, CodingMode: "CODING_MODE_2_0" } } }],
              ContainerSettings: { Container: "M3U8" },
            },
          ],
        }],
      },
    };

    await client.send(new CreateJobCommand(job));
    console.log(`MediaConvert job submitted for: ${key}`);
  }
};
