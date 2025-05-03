import { useStyles$, component$, useSignal, $ } from "@builder.io/qwik";
import { server$ } from '@builder.io/qwik-city';
import type { DocumentHead } from "@builder.io/qwik-city";
import styles from './index.css?inline';

import util from 'util';
import { exec as syncExec } from 'node:child_process';

const exec = util.promisify(syncExec);

export const takePitcture = server$(async (date: string) => {
  const path = `${process.cwd()}/public/photos/${date}.jpg`.replace('/home/patatenouille', '~');
  console.log(`take picture => ${path}`);
  const { stdout } = await exec(`rpicam-still -o ${path} --width 1920 --height 1080 --flush --immediate -n`);
  console.log(stdout);
  return `${date}.jpg`;
});

export default component$(() => {
  useStyles$(styles);

  const photo = useSignal<string[]>([]);

  const time = useSignal(-1);

  const currentPhoto = useSignal<string | null>();

  const maxPhoto = 4;

  const trigger = $(() => {
    currentPhoto.value = null;
    time.value = 5;

    const interval = setInterval(async () => {
      time.value -= 1;
      if (time.value < 0) {
        clearInterval(interval);
        const time = new Date();
        await takePitcture(time.toISOString())
	console.log('okay finish');
        currentPhoto.value = `/photos/${time.toISOString()}.jpg`;
      }
    }, 1e3)
  })

  const nextPhoto = $(() => {
    photo.value = [...photo.value, currentPhoto.value as string];

    trigger()
  });

  if (photo.value.length === 4) {
    return (
      <>
      <p>Vos Photos</p>
      <div class="photos">
          {photo.value.map((p) => (
            <img src={p} alt={p} key={p} height={108} width={192} />
          ))}
      </div>
      <button type="button">Print</button>
      </>
    )
  }

  return (
    <section class="take">
      <div class="spot">
        {currentPhoto.value && (<img src={currentPhoto.value} alt="last take" height={432} width={768}/>)}
        <div class="content">
        {time.value !== -1 && <p class="conteur">{time.value}</p>}
        {
          !currentPhoto.value ? time.value === -1 && (
            <button type="button" onClick$={() => trigger()}>Demarrer</button>
          ) : (
            <>
              <button type="button" onClick$={() => trigger()} class="space">Reprendre</button>
              <button type="button" onClick$={() => nextPhoto()}>Prendre photo suivante</button>
            </>
          )
        }
        </div>
      </div>
      <div>
        <h2>Voici votre photo ({photo.value.length}/4)</h2>

        <div class="photos">
          {photo.value.map((p) => (
            <img src={p} alt={p} key={p} height={108} width={192} />
          ))}

          {new Array(maxPhoto - photo.value.length).fill(0).map((_, i) => (<div class="empty" key={`p${i}`}>Photo {photo.value.length + i}</div>))}
        </div>
      </div>
    </section>);
});


export const head: DocumentHead = {
  title: "Take page",
  meta: [
    {
      name: "description",
      content: "will take picture an show result on the bottom",
    },
  ],
};
