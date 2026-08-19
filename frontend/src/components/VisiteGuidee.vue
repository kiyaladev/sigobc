<template>
  <Teleport to="body">
    <div
      v-if="ouverte && etape"
      class="visite print-hide"
      role="dialog"
      aria-modal="true"
      aria-labelledby="visite-titre"
      aria-describedby="visite-corps"
      @keydown="auClavier"
    >
      <!--
        Le voile est découpé en quatre bandes autour de la cible plutôt que
        peint en une seule nappe percée : l'élément commenté garde son propre
        fond, ses propres couleurs, et reste cliquable comme sur la page.
      -->
      <div class="visite__voile" :style="bandeHaut" />
      <div class="visite__voile" :style="bandeBas" />
      <div class="visite__voile" :style="bandeGauche" />
      <div class="visite__voile" :style="bandeDroite" />

      <!-- Le cartouche : filet fin autour de la cible, renvoi numéroté en tête. -->
      <div v-if="cadre" class="visite__cartouche" :style="styleCartouche">
        <span class="visite__renvoi">{{ rang }}</span>
      </div>

      <!-- Le filet de renvoi : il relie physiquement la marque à sa note. -->
      <div v-if="filet" class="visite__filet" :style="filet" />

      <aside
        ref="noteEl"
        class="visite__note"
        :class="{ 'visite__note--centree': !cadre }"
        :style="styleNote"
      >
        <p class="visite__folio">Renvoi {{ rang }} sur {{ total }}</p>
        <h2 id="visite-titre" class="visite__titre">{{ etape.titre }}</h2>
        <p id="visite-corps" class="visite__corps">{{ etape.corps }}</p>

        <div class="visite__pied">
          <button type="button" class="visite__passer" @click="terminer">Passer la visite</button>
          <div class="visite__actions">
            <button
              v-if="index > 0"
              type="button"
              class="visite__bouton"
              @click="reculer"
            >
              Précédent
            </button>
            <button
              ref="actionPrincipale"
              type="button"
              class="visite__bouton visite__bouton--plein"
              @click="avancer"
            >
              {{ index === total - 1 ? 'Terminer' : 'Suivant' }}
            </button>
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * VisiteGuidee.vue
 *
 * La visite reprend la forme d'une notice explicative d'imprimé réglementaire :
 * une marque numérotée — le renvoi — encadre l'élément, un filet la relie à la
 * note qui l'explique en marge. La numérotation n'est pas un ornement : une
 * notice est par nature une liste ordonnée de renvois adossés à des cases.
 *
 * La page n'est pas noircie mais voilée, comme sous un calque : l'agent doit
 * continuer à reconnaître son écran pendant qu'on le lui commente.
 *
 * Les couleurs viennent des jetons de SIGOBC — vert et or de la commune —
 * pour que la visite appartienne à l'application, pas à un habillage tiers.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

export interface EtapeVisite {
  /** Sélecteur CSS de l'élément commenté. Absent : la note s'affiche seule, centrée. */
  cible?: string;
  titre: string;
  corps: string;
}

const props = defineProps<{
  modelValue: boolean;
  etapes: EtapeVisite[];
}>();

const emit = defineEmits<{
  'update:modelValue': [valeur: boolean];
  termine: [];
}>();

const MARGE = 16; // Respiration minimale entre la note et le bord de l'écran.
const JEU = 8; // Écart entre le cartouche et la cible.
const LARGEUR_NOTE = 344;

const index = ref(0);
const cadre = ref<{ top: number; left: number; width: number; height: number } | null>(null);
const actionPrincipale = ref<HTMLElement | null>(null);
const noteEl = ref<HTMLElement | null>(null);
/**
 * Hauteur réelle de la note. Le calage vertical en dépend : une note plus
 * haute que prévu débordait du bas de l'écran quand on l'estimait à l'aveugle.
 */
const hauteurNote = ref(260);
const largeurEcran = ref(typeof window === 'undefined' ? 1024 : window.innerWidth);

const ouverte = computed(() => props.modelValue);
const etape = computed(() => props.etapes[index.value]);
const total = computed(() => props.etapes.length);
const rang = computed(() => index.value + 1);
/** Sous 720 px il n'y a plus de marge où annoter : la note s'ancre en bas. */
const enFeuillet = computed(() => largeurEcran.value < 720);

// ── Mesure de la cible ──────────────────────────────────────────────────────

function cible(): HTMLElement | null {
  const sel = etape.value?.cible;
  if (!sel) return null;
  return document.querySelector<HTMLElement>(sel);
}

/**
 * Nombre de mesures consécutives sans cible. Une disparition passagère (un
 * tiroir qui s'anime, une liste qui se recompose) ne doit pas interrompre la
 * visite ; une disparition durable — changement de page — si.
 */
let manques = 0;
const MANQUES_TOLERES = 3;

function mesurer(): void {
  const el = cible();
  const attendue = Boolean(etape.value?.cible);
  if (!el) {
    cadre.value = null;
    // Le renvoi désigne un élément qui n'est plus là : la note ne commente
    // plus rien, mieux vaut refermer que pointer dans le vide.
    if (attendue && ++manques >= MANQUES_TOLERES) terminer();
    return;
  }
  const r = el.getBoundingClientRect();
  // Élément replié par un point d'arrêt, ou tiroir poussé hors de l'écran :
  // on le traite comme absent plutôt que d'encadrer du vide.
  if (!dansLeChamp(r)) {
    cadre.value = null;
    if (attendue && ++manques >= MANQUES_TOLERES) terminer();
    return;
  }
  manques = 0;
  cadre.value = {
    top: r.top - JEU,
    left: r.left - JEU,
    width: r.width + JEU * 2,
    height: r.height + JEU * 2,
  };
}

/**
 * Vrai quand l'élément est réellement affiché. Un élément replié dans un
 * accordéon ou masqué par une classe de point d'arrêt reste dans le document
 * mais ne mesure rien : l'encadrer produirait un renvoi qui ne montre rien.
 */
function estVisible(sel: string): boolean {
  const el = document.querySelector<HTMLElement>(sel);
  if (!el) return false;
  return dansLeChamp(el.getBoundingClientRect());
}

/**
 * Un tiroir refermé est simplement poussé hors de l'écran : il garde ses
 * dimensions et son rectangle reste mesurable, mais il n'y a rien à montrer.
 * Seul l'axe horizontal est contrôlé — un élément situé plus bas dans la page
 * est parfaitement légitime, `scrollIntoView` va le chercher.
 */
function dansLeChamp(r: DOMRect): boolean {
  if (r.width === 0 && r.height === 0) return false;
  const largeur = typeof window === 'undefined' ? 1024 : window.innerWidth;
  return r.right > 0 && r.left < largeur;
}

async function allerA(n: number, sens: 1 | -1 = 1): Promise<void> {
  // Une étape dont la cible a disparu est franchie sans bruit plutôt que
  // d'ouvrir une note orpheline.
  let i = n;
  while (i >= 0 && i < props.etapes.length) {
    const sel = props.etapes[i]?.cible;
    if (!sel || estVisible(sel)) break;
    i += sens;
  }
  if (i < 0 || i >= props.etapes.length) {
    terminer();
    return;
  }

  index.value = i;
  manques = 0;
  await nextTick();
  const el = cible();
  el?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
  // Laisser le défilement se poser avant de mesurer.
  await new Promise((r) => setTimeout(r, 220));
  mesurer();
  await nextTick();
  mesurerNote();
  actionPrincipale.value?.focus();
}

/** Relève la hauteur rendue de la note pour recaler sa position. */
function mesurerNote(): void {
  const h = noteEl.value?.offsetHeight;
  if (h && h !== hauteurNote.value) hauteurNote.value = h;
}

// ── Navigation ──────────────────────────────────────────────────────────────

function avancer(): void {
  if (index.value >= total.value - 1) terminer();
  else void allerA(index.value + 1, 1);
}

function reculer(): void {
  if (index.value > 0) void allerA(index.value - 1, -1);
}

function terminer(): void {
  emit('update:modelValue', false);
  emit('termine');
}

function auClavier(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    e.preventDefault();
    terminer();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    avancer();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    reculer();
  }
}

// ── Suivi de la page ────────────────────────────────────────────────────────

function auMouvement(): void {
  largeurEcran.value = window.innerWidth;
  mesurer();
}

let horloge: ReturnType<typeof setInterval> | null = null;

function ecouter(actif: boolean): void {
  if (typeof window === 'undefined') return;
  const methode = actif ? 'addEventListener' : 'removeEventListener';
  window[methode]('resize', auMouvement);
  // En capture : le défilement d'un conteneur interne compte autant que celui
  // de la fenêtre.
  window[methode]('scroll', auMouvement, true);

  // `resize` et `scroll` ne couvrent pas tout : une navigation, un accordéon
  // qui se replie ou un contenu qui arrive déplacent la cible sans les
  // déclencher. Une mesure régulière rattrape ces cas et recale le cartouche.
  if (actif) {
    horloge ??= setInterval(() => {
      mesurer();
      mesurerNote();
    }, 400);
  } else if (horloge !== null) {
    clearInterval(horloge);
    horloge = null;
  }
}

watch(
  () => props.modelValue,
  (ouvert) => {
    if (ouvert) {
      ecouter(true);
      void allerA(0, 1);
    } else {
      ecouter(false);
      index.value = 0;
      cadre.value = null;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => ecouter(false));

// ── Géométrie ───────────────────────────────────────────────────────────────

const px = (n: number) => `${Math.round(n)}px`;

/** Les quatre bandes de voile qui cernent la cible. */
const bandeHaut = computed(() =>
  cadre.value
    ? { top: '0', left: '0', right: '0', height: px(Math.max(0, cadre.value.top)) }
    : { inset: '0' },
);
const bandeBas = computed(() =>
  cadre.value
    ? { top: px(cadre.value.top + cadre.value.height), left: '0', right: '0', bottom: '0' }
    : { display: 'none' },
);
const bandeGauche = computed(() =>
  cadre.value
    ? {
        top: px(cadre.value.top),
        left: '0',
        width: px(Math.max(0, cadre.value.left)),
        height: px(cadre.value.height),
      }
    : { display: 'none' },
);
const bandeDroite = computed(() =>
  cadre.value
    ? {
        top: px(cadre.value.top),
        left: px(cadre.value.left + cadre.value.width),
        right: '0',
        height: px(cadre.value.height),
      }
    : { display: 'none' },
);

const styleCartouche = computed(() =>
  cadre.value
    ? {
        top: px(cadre.value.top),
        left: px(cadre.value.left),
        width: px(cadre.value.width),
        height: px(cadre.value.height),
      }
    : {},
);

/** Position retenue pour la note, et le filet qui l'y rattache. */
const placement = computed(() => {
  if (!cadre.value || enFeuillet.value) return null;
  const c = cadre.value;
  const dispoDroite = window.innerWidth - (c.left + c.width);
  const dispoGauche = c.left;
  if (dispoDroite >= LARGEUR_NOTE + MARGE * 2) return 'droite' as const;
  if (dispoGauche >= LARGEUR_NOTE + MARGE * 2) return 'gauche' as const;
  return 'dessous' as const;
});

const styleNote = computed(() => {
  if (enFeuillet.value || !cadre.value) return {};
  const c = cadre.value;
  const hauteurVue = window.innerHeight;

  if (placement.value === 'droite' || placement.value === 'gauche') {
    const left =
      placement.value === 'droite' ? c.left + c.width + MARGE * 2 : c.left - MARGE * 2 - LARGEUR_NOTE;
    // La note s'aligne sur le haut du cartouche, puis se recale si elle déborde.
    const top = Math.max(MARGE, Math.min(c.top, hauteurVue - MARGE - hauteurNote.value));
    return { left: px(left), top: px(top), width: px(LARGEUR_NOTE) };
  }

  const souslaCible = c.top + c.height + MARGE * 2;
  const top =
    souslaCible + hauteurNote.value > hauteurVue
      ? Math.max(MARGE, c.top - MARGE * 2 - hauteurNote.value)
      : souslaCible;
  const left = Math.min(
    Math.max(MARGE, c.left),
    Math.max(MARGE, window.innerWidth - MARGE - LARGEUR_NOTE),
  );
  return { left: px(left), top: px(top), width: px(LARGEUR_NOTE) };
});

/** Le filet de renvoi, tiré du bord du cartouche jusqu'à la note. */
const filet = computed(() => {
  if (!cadre.value || enFeuillet.value) return null;
  const c = cadre.value;
  if (placement.value === 'droite') {
    return {
      top: px(c.top + Math.min(c.height / 2, 24)),
      left: px(c.left + c.width),
      width: px(MARGE * 2),
      height: '1px',
    };
  }
  if (placement.value === 'gauche') {
    return {
      top: px(c.top + Math.min(c.height / 2, 24)),
      left: px(c.left - MARGE * 2),
      width: px(MARGE * 2),
      height: '1px',
    };
  }
  return {
    top: px(c.top + c.height),
    left: px(c.left + Math.min(c.width / 2, 40)),
    width: '1px',
    height: px(MARGE * 2),
  };
});
</script>

<style scoped lang="scss">
.visite {
  position: fixed;
  inset: 0;
  z-index: 7000;
  // Le calque ne capte rien : l'agent peut continuer à lire, et même
  // manipuler l'élément qu'on lui commente.
  pointer-events: none;
}

// Le voile, pas un noir : la page reste lisible dessous, comme sous calque.
.visite__voile {
  position: fixed;
  background: rgba(244, 247, 251, 0.88);
  backdrop-filter: saturate(140%) blur(1px);
  pointer-events: auto;
}

// ── Le cartouche et son renvoi ─────────────────────────────────────────────

.visite__cartouche {
  position: fixed;
  border: 1px solid #1b5e3b;
  border-radius: var(--radius-sm, 10px);
  box-shadow: var(--shadow-md, 0 18px 40px rgba(15, 23, 42, 0.08));
  transition:
    top var(--dur, 260ms) var(--ease, cubic-bezier(0.32, 0.72, 0, 1)),
    left var(--dur, 260ms) var(--ease, cubic-bezier(0.32, 0.72, 0, 1)),
    width var(--dur, 260ms) var(--ease, cubic-bezier(0.32, 0.72, 0, 1)),
    height var(--dur, 260ms) var(--ease, cubic-bezier(0.32, 0.72, 0, 1));
}

// La marque de renvoi : le numéro qu'on porte en tête de la case commentée.
.visite__renvoi {
  position: absolute;
  top: -11px;
  left: -11px;
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: var(--radius-pill, 980px);
  background: #1b5e3b;
  color: #fff;
  font-family: var(--face-appareil, inherit);
  font-size: 0.6875rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.visite__filet {
  position: fixed;
  background: #c5a84d;
  opacity: 0.9;
}

// ── La note en marge ───────────────────────────────────────────────────────

.visite__note {
  position: fixed;
  pointer-events: auto;
  padding: var(--space-5, 24px);
  background: var(--surface-2, #fff);
  border: 1px solid var(--surface-border, rgba(148, 163, 184, 0.18));
  border-radius: var(--radius-md, 14px);
  box-shadow: var(--shadow-lg, 0 24px 56px rgba(15, 23, 42, 0.12));
}

// Sans cible, la note se pose au centre : c'est l'ouverture et la clôture.
.visite__note--centree {
  top: 50%;
  left: 50%;
  width: min(420px, calc(100vw - 32px));
  transform: translate(-50%, -50%);
}

.visite__folio {
  margin: 0 0 8px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--text-soft, #64748b);
  font-variant-numeric: tabular-nums;
}

.visite__titre {
  margin: 0 0 var(--space-2, 8px);
  font-size: 1.0625rem;
  font-weight: 650;
  letter-spacing: -0.015em;
  line-height: 1.25;
  color: #262626;
}

.visite__corps {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #404040;
}

.visite__pied {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3, 12px);
  margin-top: var(--space-5, 24px);
}

.visite__actions {
  display: flex;
  gap: var(--space-2, 8px);
}

.visite__passer {
  padding: 0;
  border: 0;
  background: none;
  color: var(--text-soft, #64748b);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;

  &:hover {
    color: #262626;
  }
}

.visite__bouton {
  padding: 7px 14px;
  border: 1px solid var(--surface-border, rgba(148, 163, 184, 0.35));
  border-radius: var(--radius-pill, 980px);
  background: transparent;
  color: #262626;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--dur-fast, 120ms) var(--ease-out, ease);

  &:hover {
    background: rgba(15, 23, 42, 0.04);
  }

  &:focus-visible {
    outline: 2px solid #1b5e3b;
    outline-offset: 2px;
  }
}

.visite__bouton--plein {
  border-color: transparent;
  background: #1b5e3b;
  color: #fff;

  &:hover {
    background: #164c30;
  }
}

// ── Sous 720 px : plus de marge, la note devient un feuillet en pied ───────

@media (max-width: 719px) {
  .visite__note {
    top: auto !important;
    right: var(--space-4, 16px);
    bottom: var(--space-4, 16px);
    left: var(--space-4, 16px) !important;
    width: auto !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .visite__cartouche {
    transition: none;
  }
}
</style>
