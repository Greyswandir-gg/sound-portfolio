"use strict";

/* Наполнение из резюме. Автор музыки — ALIEWILLEATYXU.
   Чтобы поправить карточку, меняйте title / text у нужной работы. */

const AUTHOR = "ALIEWILLEATYXU";

const TONE = {
  score: "#e7a23a",
  ambient: "#9ec9ff",
  design: "#ff6a3d",
  video: "#c4b2ff",
};

const MIX_LAYERS = [
  { id: "color", title: "Color", src: "media/design/color-impacts.mp3" },
  { id: "gun", title: "Gun", src: "media/design/gun-impacts.mp3" },
  { id: "robot", title: "Robot", src: "media/design/robot-impact.mp3" },
  { id: "ultra", title: "Ultra", src: "media/design/ultra-impact.mp3" },
];

function piece(spec, index) {
  return {
    id: spec.id,
    num: String(index + 1).padStart(2, "0"),
    title: spec.title,
    cat: spec.cat,
    catLabel: spec.catLabel,
    role: spec.role,
    hear: AUTHOR,
    length: spec.length,
    text: spec.text,
    note: `Запись из сессии. Автор музыки — ${AUTHOR}.`,
    tone: TONE[spec.cat],
    src: spec.src || "",
    video: spec.video || "",
  };
}

const WORKS = [
  ["score-01", "Готический замок", "score", "Саундтрек", "Музыка", "1:22", "Саундтрек.", "media/score/01-castle.mp3"],
  ["score-02", "Страх ночи", "score", "Саундтрек", "Музыка", "0:31", "Саундтрек.", "media/score/02-night-fear.mp3"],
  ["score-03", "Заставка субботнего дела", "score", "Саундтрек", "Музыка", "0:14", "Саундтрек.", "media/score/03-saturday.mp3"],
  ["score-04", "Напряжение сквозь пустоту", "score", "Саундтрек", "Музыка", "1:17", "Саундтрек.", "media/score/04-void.mp3"],
  ["score-05", "Это место не для тебя", "score", "Саундтрек", "Музыка", "0:53", "Саундтрек.", "media/score/05-not-for-you.mp3"],
  ["score-06", "Город героев", "score", "Саундтрек", "Музыка", "1:21", "Саундтрек.", "media/score/06-heroes.mp3"],
  ["score-07", "Пианино", "score", "Саундтрек", "Музыка", "0:29", "Саундтрек.", "media/score/07-piano.mp3"],
  ["score-08", "Он наша надежда", "score", "Саундтрек", "Музыка", "1:12", "Саундтрек.", "media/score/08-hope.mp3"],
  ["score-09", "Напряжённый триллер", "score", "Саундтрек", "Музыка", "0:44", "Саундтрек.", "media/score/09-thriller.mp3"],
  ["score-10", "Киллер", "score", "Саундтрек", "Музыка", "0:53", "Саундтрек.", "media/score/10-killer.mp3"],
  ["score-11", "Старый магнитофон", "score", "Саундтрек", "Музыка", "0:31", "Саундтрек.", "media/score/11-tape.mp3"],
  ["score-12", "Киберпанк", "score", "Саундтрек", "Музыка", "0:50", "Саундтрек.", "media/score/12-cyber.mp3"],
  ["score-13", "Погоня и битва", "score", "Саундтрек", "Музыка", "0:41", "Саундтрек.", "media/score/13-chase.mp3"],
  ["score-14", "Чертова падь", "score", "Саундтрек", "Музыка", "0:46", "Саундтрек.", "media/score/14-ravine.mp3"],
  ["score-15", "Игрушки", "score", "Саундтрек", "Музыка", "1:02", "Саундтрек.", "media/score/15-toys.mp3"],
  ["score-16", "Chainsaw Bear", "score", "Саундтрек", "Музыка", "1:21", "Саундтрек.", "media/score/16-chainsaw-bear.mp3"],
  ["score-17", "Chainsaw Bear II", "score", "Саундтрек", "Музыка", "0:27", "Саундтрек.", "media/score/17-chainsaw-bear-2.mp3"],
  ["score-18", "Your Time Is Over", "score", "Саундтрек", "Музыка", "2:35", "Саундтрек.", "media/score/18-your-time.mp3"],
  ["amb-01", "Безумие ночного погоста", "ambient", "Эмбиент", "Музыка", "0:39", "Эмбиент.", "media/ambient/01-pogost.mp3"],
  ["amb-02", "Ночная заброшенная башня", "ambient", "Эмбиент", "Музыка", "0:38", "Эмбиент.", "media/ambient/02-tower.mp3"],
  ["amb-03", "Колодец тысячи душ", "ambient", "Эмбиент", "Музыка", "0:55", "Эмбиент.", "media/ambient/03-well.mp3"],
  ["amb-04", "Старый подвал штольни", "ambient", "Эмбиент", "Музыка", "0:55", "Эмбиент.", "media/ambient/04-mine.mp3"],
  ["amb-05", "Здесь только я один", "ambient", "Эмбиент", "Музыка", "0:21", "Эмбиент.", "media/ambient/05-alone.mp3"],
  ["amb-06", "Синий лес", "ambient", "Эмбиент", "Музыка", "0:31", "Эмбиент.", "media/ambient/06-forest.mp3"],
  ["amb-07", "Молчание", "ambient", "Эмбиент", "Музыка", "0:27", "Эмбиент.", "media/ambient/07-silence.mp3"],
  ["amb-08", "Старые друзья, новые проблемы", "ambient", "Эмбиент", "Музыка", "0:48", "Эмбиент.", "media/ambient/08-friends.mp3"],
  ["amb-09", "Твоё время вышло", "ambient", "Эмбиент", "Музыка", "0:17", "Эмбиент.", "media/ambient/09-time.mp3"],
  ["amb-10", "Заброшенный старый подвал", "ambient", "Эмбиент", "Музыка", "0:55", "Эмбиент.", "media/ambient/10-basement.mp3"],
  ["amb-11", "Деревня рядом с заводом", "ambient", "Эмбиент", "Музыка", "0:38", "Эмбиент.", "media/ambient/11-village.mp3"],
  ["amb-12", "Старый", "ambient", "Эмбиент", "Музыка", "0:29", "Эмбиент.", "media/ambient/12-old.mp3"],
  ["hit-color", "Color Impacts", "design", "Удары", "Саунд-дизайн", "0:27", "Набор ударов.", "media/design/color-impacts.mp3"],
  ["hit-gun", "Gun Impacts", "design", "Удары", "Саунд-дизайн", "0:07", "Набор ударов.", "media/design/gun-impacts.mp3"],
  ["hit-robot", "Robot Impact", "design", "Удары", "Саунд-дизайн", "0:05", "Набор ударов.", "media/design/robot-impact.mp3"],
  ["hit-ultra", "Ultra Impact", "design", "Удары", "Саунд-дизайн", "0:09", "Набор ударов.", "media/design/ultra-impact.mp3"],
  ["vid-all", "All Sounds By Me", "video", "Видео", "Саунд к кадру", "0:12", "Видео из сессии.", "", "media/video/all-sounds.mp4"],
  ["vid-combat", "Combat", "video", "Видео", "Саунд к кадру", "0:21", "Видео из сессии.", "", "media/video/combat.mp4"],
  ["vid-space", "Space", "video", "Видео", "Саунд к кадру", "0:21", "Видео из сессии.", "", "media/video/space.mp4"],
  ["vid-spell", "Spell", "video", "Видео", "Саунд к кадру", "0:09", "Видео из сессии.", "", "media/video/spell.mp4"],
  ["vid-elemental", "Elemental Spell", "video", "Видео", "Саунд к кадру", "1:03", "Видео из сессии.", "", "media/video/elemental-spell.mp4"],
  ["vid-shield", "Shield Spell", "video", "Видео", "Саунд к кадру", "0:04", "Видео из сессии.", "", "media/video/shield-spell.mp4"],
  ["vid-anime", "Anime", "video", "Видео", "Саунд к кадру", "0:07", "Видео из сессии.", "", "media/video/anime.mp4"],
  ["vid-anime-2", "Anime II", "video", "Видео", "Саунд к кадру", "0:31", "Видео из сессии.", "", "media/video/anime-2.mp4"],
  ["vid-demon", "Demon Slayer", "video", "Видео", "Саунд к кадру", "0:07", "Видео из сессии.", "", "media/video/demon-slayer.mp4"],
  ["vid-nostrum", "Nostrum", "video", "Видео", "Саунд к кадру", "0:14", "Видео из сессии.", "", "media/video/nostrum.mp4"],
  ["vid-skyrim", "Skyrim", "video", "Видео", "Саунд к кадру", "0:08", "Видео из сессии.", "", "media/video/skyrim.mp4"],
  ["vid-haniball", "Haniball", "video", "Видео", "Саунд к кадру", "1:46", "Видео из сессии.", "", "media/video/haniball.mp4"],
  ["vid-01", "Кадр 1", "video", "Видео", "Саунд к кадру", "0:15", "Видео из сессии.", "", "media/video/01.mp4"],
  ["vid-02", "Кадр 2", "video", "Видео", "Саунд к кадру", "0:34", "Видео из сессии.", "", "media/video/02.mp4"],
  ["vid-03", "Кадр 3", "video", "Видео", "Саунд к кадру", "0:15", "Видео из сессии.", "", "media/video/03.mp4"],
  ["vid-04", "Кадр 4", "video", "Видео", "Саунд к кадру", "0:27", "Видео из сессии.", "", "media/video/04.mp4"],
  ["vid-05", "Кадр 5", "video", "Видео", "Саунд к кадру", "0:15", "Видео из сессии.", "", "media/video/05.mp4"],
].map((row, index) => piece({
  id: row[0],
  title: row[1],
  cat: row[2],
  catLabel: row[3],
  role: row[4],
  length: row[5],
  text: row[6],
  src: row[7],
  video: row[8] || "",
}, index));
