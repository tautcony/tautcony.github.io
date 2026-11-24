import { site } from "./site";

export const MONSTER_COUNT = 24;

export function getMonsterSrc(index: number, baseurl: string = site.baseurl): string {
    const safeIndex = ((index - 1) % MONSTER_COUNT + MONSTER_COUNT) % MONSTER_COUNT + 1;
    return `${baseurl}/img/monsters/Monsters${safeIndex}.png`;
}

export function getRandomMonsterSrc(baseurl: string = site.baseurl): string {
    const index = Math.floor(Math.random() * MONSTER_COUNT) + 1;
    return getMonsterSrc(index, baseurl);
}
