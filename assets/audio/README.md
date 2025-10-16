# Audio Asset Notes

No binary audio is committed in this repository. The simulator's sound manager synthesizes lock, unlock, tap, and notification cues at runtime using the Web Audio API. To substitute custom recordings:

1. Place `.mp3`, `.ogg`, or `.wav` files inside this directory using the following naming convention:
   - `lock.*`
   - `unlock.*`
   - `tap.*`
   - `notification.*`
2. Update `src/scripts/sound-manager.js` by setting the `AUDIO_FILE_OVERRIDES` map to the relative paths of the uploaded files.
3. Run `npm run build:assets` to refresh the asset manifest so the new files are available to the lazy loader.

Only include audio that may be redistributed under the project's Apache 2.0 license or provide proof of compatible licensing.
