import type { ReactNode, SVGProps } from 'react'

const iconPaths = {
  amphibian: (
    <>
      <path d="M7 11c0-3 2-5 5-5s5 2 5 5c0 4-2 7-5 7s-5-3-5-7Z" />
      <path d="m7.5 14-3 3m12-3 3 3M8 8 5 6m11 2 3-2" />
      <circle cx="10" cy="10" fill="currentColor" r=".7" stroke="none" />
      <circle cx="14" cy="10" fill="currentColor" r=".7" stroke="none" />
    </>
  ),
  bat: <path d="M12 9c2-3 5-4 9-2l-2 3 2 2-4 5-3-3-2 4-2-4-3 3-4-5 2-2-2-3c4-2 7-1 9 2Z" />,
  bear: (
    <>
      <circle cx="7" cy="7" r="2" />
      <circle cx="17" cy="7" r="2" />
      <path d="M6 12a6 6 0 0 1 12 0v3a6 6 0 0 1-12 0v-3Z" />
      <path d="M10 15c1 1 3 1 4 0" />
      <circle cx="10" cy="12" fill="currentColor" r=".7" stroke="none" />
      <circle cx="14" cy="12" fill="currentColor" r=".7" stroke="none" />
    </>
  ),
  boar: (
    <>
      <path d="M4 12c0-4 3-7 8-7s8 3 8 7-3 7-8 7-8-3-8-7Z" />
      <path d="m6 7-2-3 4 2m10 1 2-3-4 2M8 15c2-2 6-2 8 0" />
      <circle cx="10" cy="14" r=".5" />
      <circle cx="14" cy="14" r=".5" />
    </>
  ),
  camel: <path d="M3 17V9l3-3 3 4 3-5 4 1 2 4h3v7h-3v-3H8v3H5v-5H3" />,
  cat: (
    <>
      <path d="m6 9 1-5 4 3h2l4-3 1 5v5a6 6 0 0 1-12 0V9Z" />
      <path d="M9 14h.01M15 14h.01M10 17h4m-6-1-4-1m12 1 4-1" />
    </>
  ),
  dog: (
    <>
      <path d="M7 8 4 6v6l3 2m10-6 3-2v6l-3 2" />
      <path d="M7 8c1-2 3-3 5-3s4 1 5 3v7a5 5 0 0 1-10 0V8Z" />
      <path d="M10 13h.01M14 13h.01m-4 3c1 1 3 1 4 0" />
    </>
  ),
  equine: (
    <>
      <path d="m8 4 7 2 3 5-2 8H8l-2-6 2-9Z" />
      <path d="M8 5 5 3v6m10-3 3-2-1 6M10 14h.01M15 13h.01" />
    </>
  ),
  fox: (
    <>
      <path d="m4 5 5 3h6l5-3-2 9-6 6-6-6-2-9Z" />
      <path d="m8 9 4 3 4-3m-6 6h4" />
    </>
  ),
  hedgehog: (
    <>
      <path d="m4 15-2-2 3-1-2-3 4 1V6l3 2 2-3 2 3 3-2v4l4-1-2 3 3 1-3 2" />
      <path d="M5 15c2-4 7-5 11-2 2 1 3 3 3 5H8c-2 0-3-1-3-3Z" />
      <circle cx="16" cy="15" fill="currentColor" r=".7" stroke="none" />
    </>
  ),
  hoofed: (
    <>
      <path d="M7 8c1-2 3-3 5-3s4 1 5 3l-1 9-4 2-4-2-1-9Z" />
      <path d="M8 7 4 4m12 3 4-3M9 13h.01M15 13h.01m-5 3h4" />
    </>
  ),
  lizard: (
    <>
      <path d="M8 9c2-2 6-2 8 0l2 2-2 2c-2 2-6 2-8 0l-2-2 2-2Z" />
      <path d="m8 9-4-3m4 7-4 3m12-7 4-3m-4 7 4 3M6 11H2" />
      <circle cx="14" cy="10" fill="currentColor" r=".6" stroke="none" />
    </>
  ),
  mustelid: (
    <>
      <path d="M4 14c1-5 5-8 11-7 3 0 5 2 5 4 0 3-3 5-7 5H7l-3 2v-4Z" />
      <path d="M5 14c-2 0-3-1-3-3m14-1h.01" />
    </>
  ),
  paw: (
    <>
      <ellipse cx="12" cy="15" rx="5" ry="4" />
      <circle cx="6" cy="10" r="2" />
      <circle cx="10" cy="7" r="2" />
      <circle cx="14" cy="7" r="2" />
      <circle cx="18" cy="10" r="2" />
    </>
  ),
  rabbit: (
    <>
      <path d="M9 9C6 5 7 2 9 2c2 0 3 4 3 7m3 0c3-4 2-7 0-7-2 0-3 4-3 7" />
      <path d="M6 14a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z" />
      <path d="M10 14h.01M14 14h.01m-4 3h4" />
    </>
  ),
  raccoon: (
    <>
      <path d="m5 8 2-4 4 3h2l4-3 2 4-1 8-6 4-6-4-1-8Z" />
      <path d="m7 11 3-2h4l3 2-3 3h-4l-3-3Zm3 6h4" />
    </>
  ),
  rodent: (
    <>
      <circle cx="7" cy="8" r="3" />
      <path d="M5 14c0-4 3-7 7-7s7 3 7 7-3 6-7 6-7-2-7-6Z" />
      <path d="M18 16c3 0 4-2 3-4M9 13h.01" />
    </>
  ),
  sheep: (
    <>
      <path d="M7 7a3 3 0 0 1 5-2 3 3 0 0 1 5 2 3 3 0 0 1 1 5 5 5 0 0 1-12 0 3 3 0 0 1 1-5Z" />
      <path d="M9 13h.01M15 13h.01m-4 3h2" />
    </>
  ),
  snake: <path d="M5 7c0-3 4-4 6-2 3 3-5 5-4 10 1 4 8 5 11 2 2-2 1-5-2-5h-4m6 5 3 2" />,
  squirrel: (
    <>
      <path d="M15 9c0-5 6-7 7-3 1 3-3 4-2 7 1 4-3 7-7 5" />
      <path d="M5 15c0-4 3-7 7-7 3 0 5 2 5 5s-2 6-6 6H6l-2 2 1-6Z" />
      <circle cx="13" cy="11" fill="currentColor" r=".7" stroke="none" />
    </>
  ),
  turtle: (
    <>
      <path d="M5 14c0-4 3-7 7-7s7 3 7 7H5Z" />
      <path d="M8 10h8m-6-3 2 7 2-7M5 12l-3-1m17 1 3-1M8 14l-2 4m10-4 2 4" />
    </>
  ),
} satisfies Record<string, ReactNode>

type AnimalIconName = keyof typeof iconPaths

const animalIconBySlug: Record<string, AnimalIconName> = {
  agama: 'lizard',
  antelope: 'hoofed',
  'arctic-fox': 'fox',
  argali: 'hoofed',
  'asiatic-black-bear': 'bear',
  badger: 'mustelid',
  bat: 'bat',
  beaver: 'rodent',
  'blind-snake': 'snake',
  boa: 'snake',
  'brown-bear': 'bear',
  camel: 'camel',
  caracal: 'cat',
  cat: 'cat',
  chamois: 'hoofed',
  chinchilla: 'rodent',
  chipmunk: 'squirrel',
  cobra: 'snake',
  'corsac-fox': 'fox',
  cow: 'hoofed',
  coypu: 'rodent',
  deer: 'hoofed',
  dhole: 'dog',
  dog: 'dog',
  donkey: 'equine',
  dormouse: 'rodent',
  'european-bison': 'hoofed',
  'fallow-deer': 'hoofed',
  'fire-bellied-toad': 'amphibian',
  'flying-squirrel': 'squirrel',
  fox: 'fox',
  frog: 'amphibian',
  gazelle: 'hoofed',
  gecko: 'lizard',
  gerbil: 'rodent',
  goat: 'hoofed',
  goral: 'hoofed',
  'grass-snake': 'snake',
  'ground-squirrel': 'squirrel',
  'guinea-pig': 'rodent',
  hamster: 'rodent',
  hare: 'rabbit',
  hedgehog: 'hedgehog',
  'honey-badger': 'mustelid',
  horse: 'equine',
  hyena: 'dog',
  jackal: 'dog',
  jerboa: 'rodent',
  kulan: 'equine',
  lemming: 'rodent',
  leopard: 'cat',
  'levantine-viper': 'snake',
  lizard: 'lizard',
  lynx: 'cat',
  marmot: 'rodent',
  marten: 'mustelid',
  mink: 'mustelid',
  mole: 'rodent',
  'mole-rat': 'rodent',
  'monitor-lizard': 'lizard',
  moose: 'hoofed',
  mouflon: 'hoofed',
  'mountain-goat': 'hoofed',
  mouse: 'rodent',
  mule: 'equine',
  'musk-deer': 'hoofed',
  'musk-ox': 'hoofed',
  muskrat: 'rodent',
  newt: 'amphibian',
  otter: 'mustelid',
  'pallas-cat': 'cat',
  pig: 'boar',
  pika: 'rabbit',
  'pit-viper': 'snake',
  'polar-bear': 'bear',
  polecat: 'mustelid',
  pony: 'equine',
  porcupine: 'hedgehog',
  rabbit: 'rabbit',
  raccoon: 'raccoon',
  'raccoon-dog': 'raccoon',
  'racer-snake': 'snake',
  rat: 'rodent',
  reindeer: 'hoofed',
  'roe-deer': 'hoofed',
  'russian-desman': 'rodent',
  sable: 'mustelid',
  saiga: 'hoofed',
  salamander: 'amphibian',
  'saw-scaled-viper': 'snake',
  sheep: 'sheep',
  sheltopusik: 'lizard',
  shrew: 'rodent',
  'siberian-salamander': 'amphibian',
  skink: 'lizard',
  'slow-worm': 'snake',
  'smooth-snake': 'snake',
  snake: 'snake',
  'snow-leopard': 'cat',
  'spadefoot-toad': 'amphibian',
  squirrel: 'squirrel',
  stoat: 'mustelid',
  tiger: 'cat',
  toad: 'amphibian',
  'toad-headed-agama': 'lizard',
  'tree-frog': 'amphibian',
  turtle: 'turtle',
  viper: 'snake',
  vole: 'rodent',
  'water-buffalo': 'hoofed',
  weasel: 'mustelid',
  'wild-boar': 'boar',
  wildcat: 'cat',
  wolf: 'dog',
  wolverine: 'mustelid',
  yak: 'hoofed',
}

export type AnimalIconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  size?: number
  slug: string
  title?: string
}

function getAnimalIconName(slug: string): AnimalIconName {
  return animalIconBySlug[slug] ?? 'paw'
}

export function AnimalIcon({ size = 20, slug, title, ...props }: AnimalIconProps) {
  const iconName = getAnimalIconName(slug)
  const isDecorative = title === undefined

  return (
    <svg
      {...props}
      aria-hidden={isDecorative || undefined}
      data-animal-slug={slug}
      fill="none"
      focusable="false"
      height={size}
      role={isDecorative ? undefined : 'img'}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      {iconPaths[iconName]}
    </svg>
  )
}
