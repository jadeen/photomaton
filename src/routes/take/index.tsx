import { useStyles$, component$, useSignal, $ } from "@builder.io/qwik";
import { server$, useNavigate } from '@builder.io/qwik-city';
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
  const nav = useNavigate();

  const hideButton = useSignal(false);

  const time = useSignal(-1);

  const currentPhoto = useSignal<string | null>();

  const trigger = $(() => {
    currentPhoto.value = null;
    time.value = 5;
    hideButton.value = true;

    const interval = setInterval(async () => {
      time.value -= 1;

      if (time.value < 0) {
        clearInterval(interval);
        const time = new Date();
        await takePitcture(time.toISOString())
        currentPhoto.value = `/photos/${time.toISOString()}.jpg`;
        hideButton.value = false;
      }
    }, 1e3)
  })

  const print = $(async () => {
    console.log('redirect stat');
    await nav('/');

    console.log('redirect end');
  })

  return (
    <section class="take">
      <div class="spot">
        {currentPhoto.value && (<img src={currentPhoto.value} alt="last take" height={432} width={768}/>)}
        <div class="content">
        {time.value !== -1 && <p class="conteur">{time.value}</p>}
        {!hideButton.value  && !currentPhoto.value && (<button type="button" onClick$={() => trigger()}>Demarrer</button>)}

        {!hideButton.value && currentPhoto.value &&  (<>
          <button type="button" onClick$={() => trigger()}>Prendre une nouvelle photo</button>
          <a href="/">Terminé</a>
          </>
          )}
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
