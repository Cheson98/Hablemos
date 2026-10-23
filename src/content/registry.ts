// Bouwt opzoeklijsten voor oefeningen en lessen. Geen JSON-imports hierin, zodat het testbaar is.
import type { Exercise, Level, Lesson } from '../types';

export type LessonRef = { level: Level; lesson: Lesson; li: number; si: number };

export type Registry = {
  exercises: Map<string, Exercise>;
  exerciseLevel: Map<string, Level>;
  exerciseLesson: Map<string, string>;
  lessons: Map<string, LessonRef>;
};

/** Alle oefeningen van een les, in volgorde (bij een gesprek: de beurten van de gebruiker). */
export function lessonExercises(lesson: Lesson): Exercise[] {
  if (lesson.kind === 'dialogue' && lesson.dialogue) {
    const out: Exercise[] = [];
    for (const t of lesson.dialogue.turns) if (t.who === 'you') out.push(t.ex);
    return out;
  }
  if (lesson.kind === 'learn') return lesson.quiz ?? [];
  return lesson.exercises ?? [];
}

export function buildRegistry(levels: Level[]): Registry {
  const exercises = new Map<string, Exercise>();
  const exerciseLevel = new Map<string, Level>();
  const exerciseLesson = new Map<string, string>();
  const lessons = new Map<string, LessonRef>();
  levels.forEach((level, li) => {
    level.lessons.forEach((lesson, si) => {
      lessons.set(lesson.id, { level, lesson, li, si });
      if (lesson.kind === 'dialogue' && lesson.dialogue) {
        let last: { es: string; nl: string } | undefined;
        for (const t of lesson.dialogue.turns) {
          if (t.who === 'npc') last = { es: t.es, nl: t.nl };
          else if (last) t.ex.npc = last;
        }
      }
      for (const ex of lessonExercises(lesson)) {
        exercises.set(ex.id, ex);
        exerciseLevel.set(ex.id, level);
        exerciseLesson.set(ex.id, lesson.id);
      }
    });
  });
  return { exercises, exerciseLevel, exerciseLesson, lessons };
}
