import { useStyles$, component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import styles from './index.css?inline';

export default component$(() => {
  useStyles$(styles);

  return (
    <div class="container">
      <h1>Photomaton</h1>
      <p>Créer vous un souvenir de cet évènement</p>
      <a href="/take">Démarrer</a>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
