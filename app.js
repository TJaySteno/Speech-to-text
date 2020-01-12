async function main() {

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');
  const fs = require('fs');

  // Creates a client
  const client = new speech.SpeechClient();

  // Check for data directory and create if it doesn't exist
  try {
    fs.statSync('transcripts');
    console.log('TRANSCRIPTS DIR: already exists\n');
  } catch (err) {
    fs.mkdirSync('transcripts');
    console.log('TRANSCRIPTS DIR: created\n');
  }

  // File(s)
  const fileName = ['20180727 103921'];

  // START OF LOOP

  for (let i = 0; i < fileName.length; i++) {

    // Set config
      // NOTE: Make sure audio files come correct!
        // mono channel, .flac, & 16000 sample rate only
    const request = {
      config: {
        encoding: "flac",
        sample_rate: 16000,

        languageCode: 'en-US',
        alternativeLanguageCodes: [`en-US`, `en-TZ`],

        // enableAutomaticPunctuation: true,

        // two people speaking
        enableSpeakerDiarization: true,
        diarizationSpeakerCount: 2
      },
      audio: {
        uri: `gs://carolyn-interviews/${fileName[i]}.flac`
      }
    };

    // Make request to Speech to Text API
    console.log(`Making request on file ${fileName[i]}.flac\n`);
    const [operation] = await client.longRunningRecognize(request)
      .catch(console.error);

    // Get a Promise representation of the final result of the job
    const [response] = await operation.promise();
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log('Transcription complete!');

    // Save transcript as a new file
    const file = `./transcripts/${fileName[i]}.txt`;
    const data = transcription;
    fs.writeFile(file, data, err => {
      if (err) throw err;
      console.log('The file has been saved!');
    });

  }
  // END OF LOOP

}

main().catch(console.error);
